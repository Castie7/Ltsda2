<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('auth/login', 'Auth::login');

// API Group
$routes->group('api', function($routes) {
    $routes->get('members', 'Members::index');             // GET api/members
    $routes->post('members/create', 'Members::create');    // POST api/members/create
    $routes->get('members/(:num)', 'Members::show/$1');    // GET api/members/1
    
    // FIX: Removed the extra "api/" and updated the path to match your Vue fetch URL
    $routes->post('members/update/(:num)', 'Members::update/$1'); // POST api/members/update/1
    $routes->delete('members/(:num)', 'Members::delete/$1');       // DELETE api/members/1
    $routes->post('members/import', 'Members::import');           // POST api/members/import

    // USERS ROUTES
    $routes->get('users/(:num)', 'Users::show/$1');         // GET api/users/1
    $routes->post('users/update/(:num)', 'Users::update/$1'); // POST api/users/update/1
    
    // ADMIN ROUTES
    $routes->get('admin/logs', 'Admin::logs');
    $routes->get('admin/users', 'Admin::users');
    $routes->post('admin/users/create', 'Admin::createUser');
    $routes->post('admin/users/reset-password/(:num)', 'Admin::resetPassword/$1');

    // Database Management
    $routes->get('admin/database/backup', 'Admin::backupDatabase');
    $routes->post('admin/database/import', 'Admin::importDatabase');
});