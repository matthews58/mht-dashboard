<?php
/*
* Plugin Name: MHT Angular Dashboard Plugin
* Description: Custom plugin for Morris Hockey Training.
* Version: 2.0.0
* Author: Connor Morris
*/

add_filter('rest_authentication_errors', function ($result) {
    if (!empty($result)) {
        return $result;
    }

    if (is_user_logged_in()) {
        return true;
    }

    return $result;
});

foreach (glob(plugin_dir_path(__FILE__) . 'rest/*.php') as $file) {
    require_once $file;
}

function load_ng_scripts() {             
    wp_enqueue_style(
        'material-symbols',
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
        [],
        null
    );                                                                                                                                                                 
    wp_register_style( 'ng_styles', plugin_dir_url( __FILE__ ) . 'dist/mht-dashboard/browser/styles-WRO5SBID.css' );                                                                                                   
    wp_register_script( 'ng_main', plugin_dir_url( __FILE__ ) . 'dist/mht-dashboard/browser/main-ZCTCMUAJ.js', [], null, true );
    
    wp_localize_script(
        'ng_main',
        'MHTData',
        [
            'restUrl' => home_url('/wp-json'),
            'nonce'   => wp_create_nonce('wp_rest')
        ]
    );                                            
}

add_action( 'wp_enqueue_scripts', 'load_ng_scripts' );    

add_action('wp_enqueue_scripts', function () {

    $post = get_post();
    if (!$post) {
        return;
    }

    if (!has_shortcode($post->post_content, 'mht_dashboard')) {
        return;
    }

    /**
     * Ultimate Member scripts/styles
     * Remove these because Angular owns the UI here
     */
    wp_dequeue_script('um-raty');
    wp_dequeue_script('ultimate-member');

    wp_dequeue_style('um-styles');
    wp_dequeue_style('um-font-awesome');

}, 100);

function attach_ng() {
    wp_enqueue_style( 'ng_styles' );                                                                                                                                                                                 
    wp_enqueue_script( 'ng_main' );
    return "<app-root></app-root>";                                                                                                                                                                                
}                                                                                                                                                                                                                  
                                                                                                                                                                                                                   
add_shortcode( 'mht_dashboard', 'attach_ng' );  