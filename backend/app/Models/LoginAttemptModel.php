<?php
namespace App\Models;
use CodeIgniter\Model;

class LoginAttemptModel extends Model {
    protected $table = 'login_attempts';
    protected $primaryKey = 'id';
    protected $allowedFields = ['ip_address', 'username', 'attempted_at'];

    /**
     * Record a failed login attempt.
     */
    public function recordAttempt(string $ip, string $username): void {
        $this->insert([
            'ip_address'   => $ip,
            'username'     => $username,
            'attempted_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Count recent failed attempts (last 30 minutes) for an IP+username.
     */
    public function getRecentAttemptCount(string $ip, string $username): int {
        $since = date('Y-m-d H:i:s', strtotime('-30 minutes'));
        return $this->where('ip_address', $ip)
                    ->where('username', $username)
                    ->where('attempted_at >=', $since)
                    ->countAllResults();
    }

    /**
     * Get the timestamp of the most recent failed attempt.
     */
    public function getLastAttemptTime(string $ip, string $username): ?string {
        $row = $this->where('ip_address', $ip)
                    ->where('username', $username)
                    ->orderBy('attempted_at', 'DESC')
                    ->first();
        return $row ? $row['attempted_at'] : null;
    }

    /**
     * Clear all attempts for an IP+username (called on successful login).
     */
    public function clearAttempts(string $ip, string $username): void {
        $this->where('ip_address', $ip)
             ->where('username', $username)
             ->delete();
    }

    /**
     * Get lockout info based on progressive schedule.
     * Returns: ['locked' => bool, 'retry_after' => seconds, 'attempts' => int]
     *
     * Schedule:
     *   3 attempts → 1 minute lockout
     *   6 attempts → 3 minutes lockout
     *   9+ attempts → 15 minutes lockout
     */
    public function getLockoutInfo(string $ip, string $username): array {
        $attempts = $this->getRecentAttemptCount($ip, $username);
        $lastAttempt = $this->getLastAttemptTime($ip, $username);

        if ($attempts < 3 || !$lastAttempt) {
            return ['locked' => false, 'retry_after' => 0, 'attempts' => $attempts];
        }

        // Determine lockout duration based on attempt count
        if ($attempts >= 9) {
            $lockoutSeconds = 15 * 60; // 15 minutes
        } elseif ($attempts >= 6) {
            $lockoutSeconds = 3 * 60;  // 3 minutes
        } else {
            $lockoutSeconds = 1 * 60;  // 1 minute
        }

        $lastAttemptTime = strtotime($lastAttempt);
        $unlockTime = $lastAttemptTime + $lockoutSeconds;
        $now = time();

        if ($now < $unlockTime) {
            return [
                'locked'      => true,
                'retry_after' => $unlockTime - $now,
                'attempts'    => $attempts,
            ];
        }

        return ['locked' => false, 'retry_after' => 0, 'attempts' => $attempts];
    }
}
