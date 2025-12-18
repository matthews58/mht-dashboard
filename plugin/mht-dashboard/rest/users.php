<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
  register_rest_route('mht-dashboard/v1', '/current-user', [
    'methods' => 'GET',
    'callback' => function () {
      $user = wp_get_current_user();

      return [
          'id' => $user->ID,
          'fullName' => trim($user->first_name . ' ' . $user->last_name),
          'roles' => $user->roles
      ];
    },
    'permission_callback' => function() {
      return is_user_logged_in();
    }
  ]);
});
