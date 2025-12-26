<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
  register_rest_route('mht-dashboard/v1', '/teams', [
    'methods' => 'GET',
    'callback' => 'mht_get_teams',
    'permission_callback' => function() {
      return is_user_logged_in();
    }
  ]);
});

function mht_get_teams() {
  $user_id = get_current_user_id();
  $is_admin = current_user_can('administrator');

  $args = [
    'post_type'      => 'team',
    'post_status'    => 'any',
    'posts_per_page' => -1,
    'suppress_filters' => false
  ];

  if (!$is_admin) {
    $args['meta_query'] = [
      [
        'key' => 'team_coaches',
        'value' => '"' . $user_id . '"',
        'compare' => 'LIKE',
      ],
    ];
  }

  $teams = get_posts($args);

  $results = array_map(function ($team) {
    return [
      'id' => (string) $team->ID,
      'name' => $team->post_title,
    ];
  }, $teams);

  return rest_ensure_response($results);
}