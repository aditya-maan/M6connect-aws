<?php
/**
 * @file
 * Returns the HTML for the basic html structure of a single Drupal page.
 *
 * Complete documentation for this file is available online.
 * @see https://drupal.org/node/1728208
 */
 global $base_url;
?><!DOCTYPE html>
<!--[if IEMobile 7]><html class="iem7" <?php print $html_attributes; ?>><![endif]-->
<!--[if lte IE 6]><html class="lt-ie9 lt-ie8 lt-ie7" <?php print $html_attributes; ?>><![endif]-->
<!--[if (IE 7)&(!IEMobile)]><html class="lt-ie9 lt-ie8" <?php print $html_attributes; ?>><![endif]-->
<!--[if IE 8]><html class="lt-ie9" <?php print $html_attributes; ?>><![endif]-->
<!--[if (gte IE 9)|(gt IEMobile 7)]><!--><html <?php print $html_attributes . $rdf_namespaces; ?>><!--<![endif]-->

<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <?php print $head; ?>
  <title><?php print $head_title; ?></title>

  <?php if ($default_mobile_metatags): ?>
    <meta name="MobileOptimized" content="width">
    <meta name="HandheldFriendly" content="true">
  <?php endif; ?>

  <meta http-equiv="cleartype" content="on">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />

  <link href="<?php print $base_url.'/'. path_to_theme(); ?>/images/icon-42.png" rel="apple-touch-icon" />
  <link href="<?php print $base_url.'/'. path_to_theme(); ?>/images/icon-76.png" rel="apple-touch-icon" sizes="76x76" />
  <link href="<?php print $base_url.'/'. path_to_theme(); ?>/images/icon-120.png" rel="apple-touch-icon" sizes="120x120" />
  <link href="<?php print $base_url.'/'. path_to_theme(); ?>/images/icon-152.png" rel="apple-touch-icon" sizes="152x152" />
  <link href="<?php print $base_url.'/'. path_to_theme(); ?>/images/icon-180.png" rel="apple-touch-icon" sizes="180x180" />
  <link href="<?php print $base_url.'/'. path_to_theme(); ?>/images/icon-192.png" rel="icon" sizes="192x192" />
  <link href="<?php print $base_url.'/'. path_to_theme(); ?>/images/icon-128.png" rel="icon" sizes="128x128" />

  <?php print $styles; ?>
  <?php print $scripts; ?>
  <?php if ($add_html5_shim and !$add_respond_js): ?>
    <!--[if lt IE 9]>
    <script src="<?php print $base_path . $path_to_zen; ?>/js/html5.js"></script>
    <![endif]-->
  <?php elseif ($add_html5_shim and $add_respond_js): ?>
    <!--[if lt IE 9]>
    <script src="<?php print $base_path . $path_to_zen; ?>/js/html5-respond.js"></script>
    <![endif]-->
  <?php elseif ($add_respond_js): ?>
    <!--[if lt IE 9]>
    <script src="<?php print $base_path . $path_to_zen; ?>/js/respond.js"></script>
    <![endif]-->
  <?php endif; ?>
  
<script>
$ = jQuery.noConflict();
</script>
</head>
<body class="<?php print $classes; ?>" <?php print $attributes;?>>
  <?php if ($skip_link_text && $skip_link_anchor): ?>
  <p id="skip-link"><a href="#<?php print $skip_link_anchor; ?>" class="element-invisible element-focusable"><?php print $skip_link_text; ?></a></p>
  <?php endif; ?>
  <?php print $page_top; ?>
  <?php print $page; ?>
  <?php print $page_bottom; ?>
  <div id="company-join-msz"></div>
</body>
</html>