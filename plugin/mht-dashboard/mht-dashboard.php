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

require_once plugin_dir_path(__FILE__) . 'rest/index.php';

function load_ng_scripts() {                                                                                                                                                                                       
    wp_enqueue_style( 'ng_styles', plugin_dir_url( __FILE__ ) . 'dist/mht-dashboard/browser/styles-GADOE2LQ.css' );                                                                                                   
    wp_register_script( 'ng_main', plugin_dir_url( __FILE__ ) . 'dist/mht-dashboard/browser/main-GVBKSY57.js', [], null, true );
    
    wp_localize_script(
        'ng_main',
        'MHTData',
        [
            'restUrl' => home_url('/wp-json/mht-dashboard/v1'),
            'nonce'   => wp_create_nonce('wp_rest')
        ]
    );                                            
}

add_action( 'wp_enqueue_scripts', 'load_ng_scripts' );                                                                                                                                                             
                                                                                                                           
function attach_ng() {                                                                                                                                                                                             
    wp_enqueue_script( 'ng_main' );
    return "<app-root></app-root>";                                                                                                                                                                                
}                                                                                                                                                                                                                  
                                                                                                                                                                                                                   
add_shortcode( 'mht-dashboard-1', 'attach_ng' );  