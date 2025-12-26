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
    return [
      'id' => (string) $user->ID,
      'email' => $user->user_email,
      'fullName' => $user->display_name
    ];
  }, $users);

  return rest_ensure_response($results);
}