<?php

/* * ---------------------------------------------------------------
 * CORS SETTINGS FOR VUE (VITE) 
 * ---------------------------------------------------------------
 */
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

// If the browser is just "checking" (OPTIONS), stop here and respond OK
if ($_SERVER['REQUEST_METHOD'] === "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit();
}

/* * ---------------------------------------------------------------
 * CONTINUE WITH CODEIGNITER BOOTSTRAP
 * ---------------------------------------------------------------
 */

use CodeIgniter\Boot;
use Config\Paths;

// ... rest of your original index.php code below
$minPhpVersion = '8.2'; 
if (version_compare(PHP_VERSION, $minPhpVersion, '<')) {
    // ...
}

define('FCPATH', __DIR__ . DIRECTORY_SEPARATOR);
// ...
require FCPATH . '../app/Config/Paths.php';
$paths = new Paths();
require $paths->systemDirectory . '/Boot.php';
exit(Boot::bootWeb($paths));