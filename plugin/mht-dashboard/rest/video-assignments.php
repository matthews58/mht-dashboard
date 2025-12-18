<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    register_rest_route('mht-dashboard/v1', '/video-assignments', [
        'methods' => 'GET',
        'callback' => function () {
            $posts = get_posts([
                'post_type' => 'video_assignment',
                'posts_per_page' => -1,
                'suppress_filters' => false,
                'post_status'    => 'any'
            ]);

            return array_map(function($post) {
              $video_file_id = get_field('video_file', $post->ID);
              $video_url = wp_get_attachment_url($video_file_id);

              $assigned_player_ids = get_field('assigned_players', $post->ID, true);
              $managing_coach_ids = get_field('managing_coaches', $post->ID, true);

              return [
                  'id' => $post->ID,
                  'createdAt' => $post->post_date,
                  'title' => get_field('video_title', $post->ID) ?: '',
                  'description' => get_field('video_description', $post->ID) ?: '',
                  'videoUrl' => $video_url,
                  'coaches' => getCoachNames($managing_coach_ids),
                  'playerAnswers' => getPlayerAnswers($post->ID, $assigned_player_ids),
                  'quizQuestions' => get_field('quiz_questions', $post->ID) ?: []
              ];
          }, $posts);
        },
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ]);
});

function getCoachNames($managing_coach_ids) {
  $managing_coaches = [];

  foreach ($managing_coach_ids as $coach_id) {
      $user = get_userdata($coach_id);
      if ($user) {
          $managing_coaches[] = trim($user->first_name . ' ' . $user->last_name);
      }
  }

  return $managing_coaches;
}

function getPlayerAnswers($postId, $assigned_player_ids) {
  $raw_answers = get_post_meta($postId, 'mht_player_answers', true);

  $total_questions = 0;
  while (get_post_meta($postId, "quiz_questions_{$total_questions}_question", true) !== '') {
      $total_questions++;
  }

  $player_answers = [];

  foreach ($assigned_player_ids as $player_id) {
      $user = get_userdata($player_id);
      $answers = !empty($raw_answers[$player_id]) ? $raw_answers[$player_id] : [];

      $answers_with_questions = [];
      for ($i = 0; $i < $total_questions; $i++) {
          $question = get_post_meta($postId, "quiz_questions_{$i}_question", true) ?: '';
          $answer = $answers[$i] ?? [];
          $answers_with_questions[] = [
              'question'     => $question,
              'text'         => $answer['text'] ?? null,
              'isCorrect'   => $answer['is_correct'] ?? false,
              'submittedAt' => $answer['submitted_at'] ?? null
          ];
      }

      $player_answers[] = [
          'playerName' => $user ? trim($user->first_name . ' ' . $user->last_name) : 'Unknown Player',
          'answers'     => $answers_with_questions
      ];
  }

  return $player_answers;
}
