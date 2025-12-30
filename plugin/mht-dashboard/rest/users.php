<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
  register_rest_route('mht-dashboard/v1', '/users', [
    'methods' => 'GET',
    'callback' => 'mht_get_users',
    'permission_callback' => function() {
      return is_user_logged_in();
    }
  ]);
});

function mht_get_users() {
  $users = get_users([
    'fields' => [
      'ID',
      'user_email',
      'display_name',
    ],
  ]);

  $results = array_map(function ($user) {

    $caps = get_user_meta($user->ID, 'wp_capabilities', true);

    $roles = [];
    if (is_array($caps)) {
      $roles = array_keys(
        array_filter($caps, fn($enabled) => $enabled === true)
      );
    }

    return [
      'id'       => (string) $user->ID,
      'email'    => $user->user_email,
      'fullName' => $user->display_name,
      'roles'    => $roles,
    ];
  }, $users);

  return rest_ensure_response($results);
}