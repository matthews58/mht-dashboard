<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

  register_rest_route('mht-dashboard/v1', '/video-assignments', [
    'methods'  => 'GET',
    'callback' => 'mht_get_video_assignments',
    'permission_callback' => function () {
      return is_user_logged_in();
    }
  ]);

});

function mht_get_video_assignments() {
  $user = wp_get_current_user();

  if (in_array('administrator', $user->roles, true)) {
    $posts = mht_query_all_video_assignments();
  } elseif (in_array('um_coach', $user->roles, true)) {
    $posts = mht_query_video_assignments_for_coach($user->ID);
  } else {
    return new WP_Error(
      'unauthorized_role',
      'You do not have permission to view this page.',
      ['status' => 403]
    );
  }

  return rest_ensure_response([
    'videos' => array_map('mht_map_video_assignment', $posts)
  ]);
}

function mht_query_all_video_assignments() {
  return get_posts([
    'post_type'      => 'video_assignment',
    'posts_per_page' => -1,
    'post_status'    => 'any',
    'suppress_filters' => false
  ]);
}

function mht_query_video_assignments_for_coach($coach_id) {
  return get_posts([
    'post_type'      => 'video_assignment',
    'posts_per_page' => -1,
    'post_status'    => 'any',
    'suppress_filters' => false,
    'meta_query' => [[
      'key'     => 'managing_coaches',
      'value'   => '"' . $coach_id . '"',
      'compare' => 'LIKE',
    ]]
  ]);
}

function mht_map_video_assignment($post) {
  $assignedPlayers = get_post_meta($post->ID, 'assigned_players', true) ?: [];
  if (!is_array($assignedPlayers)) {
    $assignedPlayers = [];
  }

  $rawAnswers = maybe_unserialize(
    get_post_meta($post->ID, 'mht_player_answers', true)
  ) ?: [];

  // Only supporting 1 question for now (easy to extend later)
  $question = get_post_meta($post->ID, 'quiz_questions_0_question', true);

  $details = [];
  $answeredCount = 0;
  $correctCount = 0;

  foreach ($assignedPlayers as $playerId) {
    $user = get_userdata($playerId);

    $playerName = $user
      ? trim($user->first_name . ' ' . $user->last_name) ?: $user->display_name
      : 'Player ' . $playerId;

    $answer = $rawAnswers[$playerId][0] ?? null;

    $answerText  = $answer['text'] ?? null;
    $isCorrect   = $answer['is_correct'] ?? null;
    $submittedAt = isset($answer['submitted_at'])
      ? gmdate('Y-m-d\\TH:i:s\\Z', strtotime($answer['submitted_at']))
      : null;

    if ($answerText !== null) {
      $answeredCount++;
      if ($isCorrect) {
        $correctCount++;
      }
    }

    $details[] = [
      'playerId'    => (string)$playerId,
      'playerName'  => $playerName,
      'question'    => $question,
      'answer'      => $answerText,
      'isCorrect'   => $answerText !== null ? (bool)$isCorrect : null,
      'submittedAt'=> $submittedAt
    ];
  }

  return [
    'videoId'         => (string)$post->ID,
    'title'           => get_post_meta($post->ID, 'video_title', true) ?: '',
    'createdAt'       => isset($post->post_date_gmt) ? gmdate('Y-m-d\\TH:i:s\\Z', strtotime($post->post_date_gmt)) : null,
    'playersAssigned' => count($assignedPlayers),
    'playersAnswered' => $answeredCount,
    'correctPercent'  => $answeredCount > 0
      ? round(($correctCount / $answeredCount) * 100)
      : null,
    'details'         => $details
  ];
}
