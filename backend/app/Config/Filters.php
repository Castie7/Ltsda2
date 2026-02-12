<?php

namespace Config;

use CodeIgniter\Config\Filters as BaseFilters;
use CodeIgniter\Filters\CSRF;
use CodeIgniter\Filters\DebugToolbar;
use CodeIgniter\Filters\ForceHTTPS;
use CodeIgniter\Filters\Honeypot;
use CodeIgniter\Filters\InvalidChars;
use CodeIgniter\Filters\PageCache;
use CodeIgniter\Filters\PerformanceMetrics;
use CodeIgniter\Filters\SecureHeaders;
// Use the built-in CORS class or your custom App\Filters\Cors if you created one
use CodeIgniter\Filters\Cors; 

class Filters extends BaseFilters
{
    /**
     * Configures aliases for Filter classes.
     */
    public array $aliases = [
        'csrf'          => CSRF::class,
        'toolbar'       => DebugToolbar::class,
        'honeypot'      => Honeypot::class,
        'invalidchars'  => InvalidChars::class,
        'secureheaders' => SecureHeaders::class,
        'cors'          => Cors::class,
        'forcehttps'    => ForceHTTPS::class,
        'pagecache'     => PageCache::class,
        'performance'   => PerformanceMetrics::class,
        'auth'          => \App\Filters\AuthToken::class,
    ];

    /**
     * Special required filters applied before and after other filters.
     */
    public array $required = [
        'before' => [
            'forcehttps', 
            'pagecache',  
        ],
        'after' => [
            'pagecache',   
            'performance', 
            'toolbar',     
        ],
    ];

    /**
     * Global filters applied to every request.
     */
    public array $globals = [
        'before' => [
            // Apply CORS globally to allow Vue to connect
            'cors', 
            // 'honeypot',
            // 'csrf', // Usually disabled for APIs using JWT
        ],
        'after' => [
            'toolbar',
        ],
    ];

    public array $methods = [];

    public array $filters = [
        'auth' => [
            'before' => ['api/*'],
        ],
    ];
}