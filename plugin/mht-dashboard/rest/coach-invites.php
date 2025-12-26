<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

  register_rest_route('mht-dashboard/v1', '/coach-invites', [
    'methods'  => 'GET',
    'callback' => 'get_coach_invites',
    'permission_callback' => function () {
      return is_user_logged_in();
    },
  ]);
  
  function get_coach_invites() {
    $user = wp_get_current_user();
  
    if (in_array('administrator', $user->roles, true)) {
      return rest_ensure_response(query_all_invites());
    }

    if (in_array('um_coach', $user->roles, true)) {
      $team_ids = get_team_ids_for_coach($user->ID);
      
      if (!is_array($team_ids) || empty($team_ids)) {
        return rest_ensure_response([]);
      }
    
      return rest_ensure_response(query_invites_for_teams($team_ids));
    }

    return new WP_Error(
      'unauthorized_role',
      'You do not have permission to view this page.',
      [
        'status' => 403,
      ]
    );
  }
  
  function query_all_invites() {
    $invites = get_posts([
      'post_type' => 'coach_invite',
      'posts_per_page' => -1,
      'suppress_filters' => false,
      'post_status' => 'any',
    ]);

    $player_map = build_player_name_map_from_invites($invites);
    $team_map = build_team_name_map_from_invites($invites);

    return map_invites($invites, $team_map, $player_map);
  }

  function get_team_ids_for_coach($coach_id) {
    return get_posts([
      'post_type' => 'team',
      'posts_per_page' => -1,
      'suppress_filters' => false,
      'post_status' => 'any',
      'fields' => 'ids',
      'meta_query'     => [[
        'key'     => 'team_coaches',
        'value'   => '"' . $coach_id . '"',
        'compare' => 'LIKE',
      ]]
    ]);
  }

  function query_invites_for_teams($team_ids) {
    $invites = get_posts([
      'post_type' => 'coach_invite',
      'posts_per_page' => -1,
      'suppress_filters' => false,
      'post_status' => 'any',
      'meta_query'     => [[
        'key'     => 'team_id',
        'value'   => $team_ids,
        'compare' => 'IN',
      ]]
    ]);
    
    $player_map = build_player_name_map_from_invites($invites);
    $team_map = build_team_name_map_from_invites($invites);

    return map_invites($invites, $team_map, $player_map);
  }

  function map_invites($invites, $team_map = [], $player_map = []) {
    $data = [];

    foreach ($invites as $invite) {
      $post_id = $invite->ID;
      $team_id = get_post_meta($post_id, 'team_id', true);
      $player_id = get_post_meta($post_id, 'invite_player', true);

      $data[] = [
        'player' => $player_map[$player_id] ?? '',
        'email' => get_post_meta($post_id, "invite_email", true),
        'team' => $team_map[$team_id] ?? '',
        'status' => get_post_meta($post_id, "invite_status", true),
        'invitedAt' => format_coach_invite_iso_datetime(get_post_meta($post_id, "invited_at", true) ?? null),
        'acceptedAt' => format_coach_invite_iso_datetime(get_post_meta($post_id, "accepted_at", true) ?? null),
      ];
    }


    return $data;
  }

  function build_team_name_map_from_invites(array $invites): array {
    $team_ids = [];
  
    foreach ($invites as $invite) {
      $team_id = get_post_meta($invite->ID, 'team_id', true);
      if (!empty($team_id)) {
        $team_ids[] = (int) $team_id;
      }
    }
  
    $team_ids = array_values(array_unique($team_ids));
    if (empty($team_ids)) {
      return [];
    }
  
    $teams = get_posts([
      'post_type' => 'team',
      'post__in' => $team_ids,
      'posts_per_page' => -1,
      'post_status' => 'any',
      'suppress_filters' => false,
    ]);
  
    $map = [];
    foreach ($teams as $team) {
      $map[$team->ID] = $team->post_title;
    }
  
    return $map;
  }

  function build_player_name_map_from_invites(array $invites): array {
    $user_ids = [];

    foreach ($invites as $invite) {
        $user_id = (int) get_post_meta($invite->ID, 'invite_player', true);
        if ($user_id > 0) {
            $user_ids[] = $user_id;
        }
    }

    $user_ids = array_values(array_unique($user_ids));
    if (empty($user_ids)) {
        return [];
    }

    $users = get_users([
        'include' => $user_ids,
        'fields' => ['ID', 'first_name', 'last_name', 'display_name'],
    ]);

    $map = [];
    foreach ($users as $user) {
        $map[$user->ID] = $user->display_name;
    }

    return $map;
  }

  function format_coach_invite_iso_datetime($value) {
    if (!$value) {
      return null;
    }

    $timestamp = strtotime($value);
    if ($timestamp === false) {
      return null;
    }

    return gmdate('Y-m-d\\TH:i:s\\Z', $timestamp);
  }
});
