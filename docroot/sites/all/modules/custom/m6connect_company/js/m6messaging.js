var refreshMessageFlag = 1;

// Notification sending function.
var notifyuser = function(data) {
  if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(data.title, data.options);
  }
   else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(data.title, data.options);
      }
    });
  }

  if (notification) {
    notification.onclick = function (e) {
      window.focus();
      notification.close();
      // this.cancel();
    };
  }
}

// Function to play sound in browser.
var playsound = function() {
  var filename = 'https://dev.m6connect.com/sites/all/modules/custom/m6connect_scm/sounds/notification.mp3';
  // jQuery("#sound").innerHTML = '<audio autoplay="autoplay"><source src="' + filename + '" type="audio/mpeg" /><source src="' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3" /></audio>';
  jQuery("#sound").html('<audio autoplay="autoplay"><source src="' + filename + '" type="audio/mpeg" /><embed hidden="true" autostart="true" loop="false" src="' + filename +'" /></audio>');
}

var refreshMessageContent = function(){
  var formDataValues = jQuery('.user_messaging_thread_form').serialize();
  jQuery.post( "/m6message-refresh-message",{formDataValues:formDataValues }).done(function(data){
    M6MessagingRefresh(data.insert);

    // We need to acknowledge the sender, that we have read the message.
    if (data.insert[0].seendata) {
      var myObj = [data.insert[0].seendata];
      // If we have data, then going on.
      socket_messaging.emit('receiverEmitter', JSON.stringify(myObj));
    }
    if (jQuery('#play_sound').length > 0 && jQuery('body').hasClass('page-scm')) {
      if (jQuery('#play_sound').text() == 'Yes') {
        // If notifications are allowed, only then playing it.

        // Browser notificaitons.
        if (data.insert[0].notifydata) {
          notifyuser(data.insert[0].notifydata);
        }

        // Sound notificaitons.
        if (jQuery('#play_sound').length > 0) {
          if (jQuery('#play_sound').text() == 'Yes') {
            playsound();
          }
        }
      }
    }
  });
};

var updateSeenListMessaging = function(fromusername, mid) {
  console.log(fromusername);
  console.log(mid);
  jQuery.post( "/m6message-update-seenby",{'fromusername':fromusername, 'mid':mid }).done(function(data) {
    if (data.status === 'success' && data.data) {
      jQuery('#m6-messaging-message-' + mid).find('.fa-stack').remove();
      jQuery('#m6-messaging-message-' + mid).find('.seen-by-list-outer').remove();
      jQuery('#m6-messaging-message-' + mid).find('.message-post-time').append(data.data);
    }
  });
};

Drupal.ajax.prototype.commands.SwitchMessagingCallback = function(ajax, response, status) {
  var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
  mainContainer.removeClass('delete-message-enable forword-message-enable');  
  mainContainer.find('div.m6-messaging-message.message-row').removeClass('delete-selected forword-selected');
  mainContainer.find('input.messenger-message-delete-checkbox').prop('checked', false); 
  mainContainer.find('input.messenger-message-forword-checkbox').prop('checked', false);
  jQuery('.user_messaging_thread_form').find('.message-delete-container-section').hide();
  jQuery('.user_messaging_thread_form').find('.message-forword-container-section').hide();
  jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').show();
  jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').show();
  jQuery('.message-deleted-selected-link input').val('0 Selected');
  jQuery('.message-forword-selected-link input').val('0 Selected');
  var container = jQuery("body").find("#user-messaging-thread-form-container .message-box-main-container"); 
  if(container.length){
    container.animate({scrollTop: container[0].scrollHeight}, "slow"); 
  }
}

Drupal.ajax.prototype.commands.M6MessagingSocketSend = function(ajax, response, status) {
  var myobj = Drupal.settings.m6connect_company.socket_names;
  if (myobj !== undefined) {
    // Sending sockets.
    socket_messaging.emit("messageService_broadcast", JSON.stringify(myobj));
  }
}

Drupal.ajax.prototype.commands.M6MessagingInsertDateDiv = function(ajax, response, status) {
 var container = jQuery("body").find("#user-messaging-thread-form-container .message-box-main-container"); 
 if(!container.find("div.message-box.message-date-"+response.dateformatone).length){
   container.append(response.dataDiv); 
 }
}

Drupal.ajax.prototype.commands.M6MessagingScrollBottom = function(ajax, response, status) {
 var container = jQuery("body").find("#user-messaging-thread-form-container .message-box-main-container"); 
 if(container.length){
   //container.animate({scrollTop: container[0].scrollHeight}, "slow"); 
 }
}

function M6MessagingRefresh(insert_data){
  var container = jQuery("body").find("#user-messaging-thread-form-container .message-box-main-container"); 
 jQuery.each(insert_data,function(key, value ) {
  if(value.action==="insert"){
    var selector = container.find(value.date_div_class);
    if(!selector.length){ 
     selector = jQuery(value.data_div);
     container.append(selector);
    }
    selector.append(value.message);
    container.animate({scrollTop: container[0].scrollHeight}, "slow");
  }else if(value.action==="remove"){
    container.find(value.date_div_class).remove();
    container.animate({scrollTop: container[0].scrollHeight}, "slow");
  }
 });  
}

Drupal.ajax.prototype.commands.M6MessagingRefresh = function(ajax, response, status) {
 var container = jQuery("body").find("#user-messaging-thread-form-container .message-box-main-container"); 
 jQuery.each(response.insert_data,function(key, value ) {
  if(value.action==="insert"){
    var selector = container.find(value.date_div_class);
    if(!selector.length){ 
     selector = jQuery(value.data_div);
     container.append(selector);  
    }
    selector.append(value.message);
  }else if(value.action==="remove"){
    container.find(value.date_div_class).remove();
  }
 }); 
 container.animate({scrollTop: container[0].scrollHeight}, "slow"); 
};

Drupal.behaviors.m6connect_messaging = {
    attach: function () {
   'use strict';  
   /*jQuery(".text-message-smilly").emojioneArea({
   container: ".message-abc-cont",
   hideSource: true,
   useSprite: false,
   saveEmojisAs: "image",
   imageType: "png",
   shortnames: false,
   }); */    

   jQuery("div.msg-connected-user-info").unbind('click').bind('click',function(e) {
   refreshMessageFlag = 0;
   var mappindId = jQuery(this).attr("id");
   var currmappinid = jQuery(".connected-user-select.form-select").val();
   if(mappindId!=currmappinid){
     jQuery(".connected-user-select.form-select").val(mappindId).trigger("change");
   }
   jQuery('body').find("div.msg-connected-user-info").removeClass("user-active");
   if(!jQuery(this).hasClass("user-active")){
     jQuery(this).addClass("user-active");  
   }
   });

   jQuery('.chatting-volume-up').unbind('click').bind('click', function(e) {
    e.preventDefault();
    if (jQuery(this).hasClass('on')) {
      // This means volume needs to be turned off.
      jQuery(this).removeClass('on');
      jQuery(this).addClass('off');
      jQuery(this).attr('title', 'Enable Sound and Notification');
      jQuery(this).html('<i class="fa fa-volume-off" aria-hidden="true"></i>');
      jQuery('#play_sound').text('No');
    }
    else if (jQuery(this).hasClass('off')) {
      // This means volume needs to be turned on.
      jQuery(this).removeClass('off');
      jQuery(this).addClass('on');
      jQuery(this).attr('title', 'Disable Sound and Notification');
      jQuery(this).html('<i class="fa fa-volume-up" aria-hidden="true"></i>');
      jQuery('#play_sound').text('Yes');
    }
   });

   if (jQuery(".add-new-member-box").length) {
     jQuery(".add-new-member-box").autocomplete({
      minLength: 0,
      source: function( request, response ) {
      jQuery.getJSON( "/m6messaging-user-search-ajax", {
        term: request.term,
        mapping_id: jQuery('input.messaging-mapping-mapping').val(),
      }, response );
      },
      focus: function( event, ui ) {
      //jQuery(this).val('');
          return false;
        },
      change: function(event, ui) {
          jQuery(this).val('');
      },
        select: function( event, ui ) {
      var userUid = ui.item.value;
      if(userUid!=''){
        userUid = parseInt(userUid);
        var invitedUser = jQuery('input.add-new-member-users').val();
        var invitedUserArr = [];
        if(invitedUser !=''){
        invitedUserArr = invitedUser.split(",").map(Number);
        }
        if((jQuery.inArray(userUid,invitedUserArr))===-1){
        invitedUserArr.push(userUid);
        invitedUserArr.map(Number);
        invitedUser = invitedUserArr.join();
        jQuery('input.add-new-member-users').val(invitedUser);
        jQuery('.add-new-member-markup').append('<div class="message-invited-sub pull-left label label-success" style="margin-right:10px;font-size: 12px;"><span class="message-invited-username">'+ui.item.label+'</span><span class="message-invited-user-remove">&nbsp;<a href="javascript:void(0);" class="message-invited-user-remove-link" data-useruid="'+userUid+'"><i class="fa fa-times-circle" style="font-size: 14px;color: #ffffff;"></i></a></span></div>');
        jQuery(this).val('');
        }
      }
          return false;
        }
    }).data("ui-autocomplete") ._renderItem = function( ul, item ) {
      var inner_html = '<a><div class="list_item_container-auto"><span class="image">' + item.image + '</span><span><label>' + item.label + ''+ item.userCom +'</label></span></div></a>';
        return jQuery( "<li>" )
        .data("item.autocomplete", item)
          .append( inner_html )
          .appendTo( ul );
      };
   }
}};

jQuery(document).ready(function(e) {

  jQuery(document).on('click', '.message-post-time .fa-stack', function(event) {
    /* Act on the event */
    event.preventDefault();

    // First closing any open Seen by containers.
    jQuery('.seen-by-list-outer').hide();

    // Now just showing the requested one.
    jQuery(this).parents('.message-post-time').find('.seen-by-list-outer').show('500');
  });

  jQuery(document).on('click', '.close-seen-by-list', function(event) {
    /* Act on the event */
    event.preventDefault();

    // Now hiding the requested seen by container.
    jQuery(this).parents('.message-post-time').find('.seen-by-list-outer').hide('500');
  });

  //Delete
  jQuery(document).on('click','.user_messaging_thread_form a.message-delete-cancel-link',function(e) {
   var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
   mainContainer.removeClass('delete-message-enable');
   mainContainer.find('div.m6-messaging-message.message-row').removeClass('delete-selected');
   mainContainer.find('input.messenger-message-delete-checkbox').prop('checked', false);
   jQuery('.user_messaging_thread_form').find('.message-delete-container-section').hide();
   jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').show();
   jQuery('.message-deleted-selected-link input').val('0 Selected');
  });
  
  jQuery(document).on('click','.user_messaging_thread_form a.messenger-config-delete-msg',function(e) {
   var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
   mainContainer.addClass('delete-message-enable');
   mainContainer.find('div.m6-messaging-message.message-row').removeClass('delete-selected');
   mainContainer.find('input.messenger-message-delete-checkbox').prop('checked', false);
   jQuery('.user_messaging_thread_form').find('.message-delete-container-section').show();
   jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').hide();
   jQuery('.message-deleted-selected-link input').val('0 Selected');
  }); 
  
  jQuery(document).on('click','.m6message-main-container div.m6-messaging-message.message-row.message-submitted .message-post-message', function(){
  if(jQuery('.m6message-main-container').hasClass('delete-message-enable')){
    var mainContainer = jQuery(this).closest('div.m6-messaging-message.message-row');
    var checkElement = mainContainer.find('input.messenger-message-delete-checkbox'); 
    if(checkElement.is(':checked')){
      checkElement.prop('checked', false);  
      mainContainer.removeClass('delete-selected'); 
    }else{
      checkElement.prop('checked', true);
      if(!(mainContainer.hasClass('delete-selected'))){
      mainContainer.addClass('delete-selected');
      }
    }
    var count = jQuery('input.messenger-message-delete-checkbox:checked').length;
    jQuery('.message-deleted-selected-link input').val(count+' Selected');
  }
  });
  
  
  //forword
  jQuery('#messenger-dialog').dialog({
    autoOpen: false,
  width: 700,
  modal: true,
  resizable: false,
  buttons: {
    'Forword': function () {
    if(jQuery(this).find('input.forword-mapping-checkbox:checked').length){
      var formData = jQuery(this).find('form.messenger-forword-form').serialize();
      jQuery.post('/messenger-forword-message',formData).done(function(data){
      var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
          mainContainer.removeClass('forword-message-enable');
          mainContainer.find('div.m6-messaging-message.message-row').removeClass('forword-selected');
          mainContainer.find('input.messenger-message-forword-checkbox').prop('checked', false);
          jQuery('.user_messaging_thread_form').find('.message-forword-container-section').hide();
          jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').show();
          jQuery('.message-forword-selected-link input').val('0 Selected');
      M6MessagingRefresh(data.insertMessage);
      }); 
    }
      jQuery(this).dialog('close');
      jQuery(this).html('');
    },
    'Cancel': function () {
      jQuery(this).dialog('close');
    jQuery(this).html('');
    }
  },
  open: function () {
    jQuery('.ui-dialog-buttonpane').find('button:contains("Cancel")').addClass('cancelButtonClass');
    jQuery('.ui-dialog-titlebar').hide();
  }
  });
  
  jQuery(document).on('click','.user_messaging_thread_form a.message-delete-next-link',function(e) {
  var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
  var messagecount = jQuery('input.messenger-message-delete-checkbox:checked').length; 
  var deletemessage = [];
  jQuery('input.messenger-message-delete-checkbox:checked').each(function(index, element) {
      deletemessage.push(jQuery(this).val());  
    }); 
  var deleted_message = deletemessage.join(',');
  if(deleted_message!=''){
    jQuery.post('/messenger-delete-message',{'delete-message':deleted_message}).done(function(data){ 
       M6MessagingRefresh(data.deleteMessage);
    });
    var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
    mainContainer.removeClass('delete-message-enable');
    mainContainer.find('div.m6-messaging-message.message-row').removeClass('delete-selected');
    mainContainer.find('input.messenger-message-delete-checkbox').prop('checked', false);
    jQuery('.user_messaging_thread_form').find('.message-delete-container-section').hide();
    jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').show();
    jQuery('.message-deleted-selected-link input').val('0 Selected');
  }
  });
  
  jQuery(document).on('click','.user_messaging_thread_form a.message-forword-next-link',function(e) {
   var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
   var messagecount = jQuery('input.messenger-message-forword-checkbox:checked').length;
   var connectedHtml = '';
   if (Drupal.settings.hasOwnProperty('m6connect_messenger') && Drupal.settings.m6connect_messenger.hasOwnProperty('connectedusers') && 
   messagecount>0) {
    var connecteduser = Drupal.settings.m6connect_messenger.connectedusers;
    var connectedCount = 0;
    connectedHtml += '<div class="forword-header-text margin-bottom-10"><strong>Select users/groups to forward messages:</strong></div>';
    connectedHtml += '<form method="post" class="messenger-forword-form">';
    connectedHtml += '<table class="messenger-forword-main-table table table-bordered" style="margin:0px;border:0"><tbody style="height: 386px;overflow: auto;display: block;border: 0;padding: 8px;">';
    jQuery.each(connecteduser,function(index, element) {
          connectedCount++;
      if((connectedCount % 3) ==1){
      connectedHtml += '<tr class="messenger-forword-main-row">';  
      }
      connectedHtml += '<td class="messenger-forword-mapping-row col-md-4" data-mapping="'+index+'">';
      connectedHtml += '  <div class="messenger-forword-mapping-inner clearfix">';
      connectedHtml += '    <div class="col-md-4 col-xs-4 col-sm-4 messenger-forword-user-pic padding-5 text-right">';
      connectedHtml += '      '+element.group_pic;
      connectedHtml += '    </div>';
      connectedHtml += '    <div class="col-md-8 col-xs-8 col-sm-8 messenger-forword-user-info padding-5">';
      connectedHtml += '      <div class="messenger-forword-group-name">'+element.group_name+'</div>';
      connectedHtml += '    </div>';
      connectedHtml += '  </div>';
      connectedHtml += '  <input type="checkbox" name="forword-to-mapping[]" class="forword-mapping-checkbox" value="'+index+'" style="display:none;"/>';
      connectedHtml += '</td>';
      if((connectedCount % 3) ==0){
      connectedHtml += '</tr>';  
      }
        }); 
    if((connectedCount % 3) ==1){
      connectedHtml += '<td class="col-md-4">&nbsp;</td>';
      connectedHtml += '<td class="col-md-4">&nbsp;</td>';
      connectedHtml += '</tr>';
    }else if((connectedCount % 3) ==2){
      connectedHtml += '<td class="col-md-4">&nbsp;</td>';
      connectedHtml += '</tr>';
    }
    var forwordmessage = [];
    jQuery('input.messenger-message-forword-checkbox:checked').each(function(index, element) {
          forwordmessage.push(jQuery(this).val());  
        }); 
    var currentmapping = jQuery('.user_messaging_thread_form').find('.messaging-mapping-mapping').val();
    connectedHtml += '</tbody></table>';
    connectedHtml += '<textarea style="display:none;" name="forword-to-messege">'+forwordmessage.join(',')+'</textarea>';
    connectedHtml += '<input type="hidden" name="forword-current_mapping" value="'+currentmapping+'"/>';
    connectedHtml += '</form>';
   }
   jQuery('#messenger-dialog').html(connectedHtml);
   jQuery('#messenger-dialog').dialog('open');
   return false;
  });
  
  jQuery(document).on('click','#messenger-dialog div.messenger-forword-mapping-inner', function(){
  var mainContainer = jQuery(this).closest('td.messenger-forword-mapping-row');
  var checkElement = mainContainer.find('input.forword-mapping-checkbox');  
  if(checkElement.is(':checked')){
    checkElement.prop('checked', false);  
    mainContainer.removeClass('mapping-selected'); 
  }else{
    checkElement.prop('checked', true);
    if(!(mainContainer.hasClass('mapping-selected'))){
    mainContainer.addClass('mapping-selected');
    }
  }
  });
  
  jQuery(document).on('click','.user_messaging_thread_form a.message-forword-cancel-link',function(e) {
   var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
   mainContainer.removeClass('forword-message-enable');
   mainContainer.find('div.m6-messaging-message.message-row').removeClass('forword-selected');
   mainContainer.find('input.messenger-message-forword-checkbox').prop('checked', false);
   jQuery('.user_messaging_thread_form').find('.message-forword-container-section').hide();
   jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').show();
   jQuery('.message-forword-selected-link input').val('0 Selected');
   /*mainContainer.find('div.m6-messaging-message.message-row').each(function(index, element) {
       jQuery(this).removeClass('forword-selected');
     jQuery(this).find('input.messenger-message-forword-checkbox').prop('checked', false);
    }); */
  });
  //message-delete-next-link
  
  jQuery(document).on('click','.user_messaging_thread_form a.messenger-config-forword-msg',function(e) {
   var mainContainer = jQuery('.user_messaging_thread_form').find('.m6message-main-container');
   mainContainer.addClass('forword-message-enable');
   mainContainer.find('div.m6-messaging-message.message-row').removeClass('forword-selected');
   mainContainer.find('input.messenger-message-forword-checkbox').prop('checked', false);
   jQuery('.user_messaging_thread_form').find('.message-forword-container-section').show();
   jQuery('.user_messaging_thread_form').find('.m6messenger-confid-link-main').hide();
   jQuery('.message-forword-selected-link input').val('0 Selected');
  });
  
  jQuery(document).on('click','.m6message-main-container div.m6-messaging-message.message-row .message-post-message', function(){
  if(jQuery('.m6message-main-container').hasClass('forword-message-enable')){
    var mainContainer = jQuery(this).closest('div.m6-messaging-message.message-row');
    var checkElement = mainContainer.find('input.messenger-message-forword-checkbox');  
    if(checkElement.is(':checked')){
      checkElement.prop('checked', false);  
      mainContainer.removeClass('forword-selected'); 
    }else{
      checkElement.prop('checked', true);
      if(!(mainContainer.hasClass('forword-selected'))){
      mainContainer.addClass('forword-selected');
      }
    }
    var count = jQuery('input.messenger-message-forword-checkbox:checked').length;
    jQuery('.message-forword-selected-link input').val(count+' Selected');
  }
  });
  
  //Exit Group
  jQuery('#messenger-confirmation-dialog').dialog({
    autoOpen: false,
  width: 500,
  modal: true,
  resizable: false,
  buttons: {
    'Confirm': function () {
      var messenger_action = jQuery(this).data('messenger-action');
      var formDataValues = jQuery('.user_messaging_thread_form').serialize();
      if(messenger_action == 'exit_group'){
        jQuery.post( "/m6message-exit-group",formDataValues).always(function(data) {
          window.location.href = data.redirectTo;
          });
      }else if(messenger_action == 'clear_conversation'){
       jQuery.post( "/m6message-clear-conversation",formDataValues).done(function(data) {
          if(data.isUpdated){
        jQuery("body").find("#user-messaging-thread-form-container .message-box-main-container").html('');
        }
           }); 
      }
        jQuery(this).dialog('close');
        jQuery(this).html('');
    },
    'Cancel': function () {
      jQuery(this).dialog('close');
    jQuery(this).html('');
    }
  },
  open: function () {
    jQuery('.ui-dialog-buttonpane').find('button:contains("Cancel")').addClass('cancelButtonClass');
    jQuery('.ui-dialog-titlebar').hide();
  }
  });
  jQuery(document).on('click','.user_messaging_thread_form a.messenger-config-exit-group',function(e) {
  jQuery('#messenger-confirmation-dialog').data('messenger-action','exit_group');
  jQuery('#messenger-confirmation-dialog').html('<div class="text-center" style="padding-bottom:25px;"><strong>Are you sure you want to leave this group?</strong></div>');
  jQuery('#messenger-confirmation-dialog').dialog('open');
  return false; 
  });
  
  //clear conversation
  jQuery(document).on('click','.user_messaging_thread_form a.messenger-config-clear-conversation-msg',function(e) {
  jQuery('#messenger-confirmation-dialog').data('messenger-action','clear_conversation');
  jQuery('#messenger-confirmation-dialog').html('<div class="text-center" style="padding-bottom:25px;"><strong>Are you sure you want to clear conversation from this group?</strong></div>');
  jQuery('#messenger-confirmation-dialog').dialog('open');
  return false; 
  });
  
  
  jQuery(document).on('click','.user_messaging_thread_form a.message-invited-user-remove-link',function(e) {
  var useruid = jQuery(this).data('useruid');
  useruid = parseInt(useruid);
  var invitedUser = jQuery('input.add-new-member-users').val();
  if(invitedUser!=''){
    var invitedUserArr = invitedUser.split(",").map(Number);
    var index = jQuery.inArray(useruid, invitedUserArr);
      invitedUserArr.splice(index, 1);
    invitedUser = invitedUserArr.join();
    jQuery('input.add-new-member-users').val(invitedUser);  
  }
  jQuery(this).closest('div.message-invited-sub').remove();
  });
   
  jQuery(document).on('click','.user_messaging_thread_form a.m6id-mapping-user-add',function(e) {
  jQuery('.user_messaging_thread_form').find('div.add-new-group-container-section').toggle();
  var element = jQuery('.user_messaging_thread_form').find('div.m6message-main-container');
  if(jQuery('.user_messaging_thread_form').find('div.add-new-group-container-section').is(':visible')){
    element.addClass('opacity02');
  }else if(element.hasClass('opacity02')){
    element.removeClass('opacity02');
  }
  });
  
  jQuery(document).on('click','.user_messaging_thread_form a.m6message_group_add_cancel',function(e) {
  jQuery('.user_messaging_thread_form').find('div.add-new-group-container-section').toggle();
  jQuery('.user_messaging_thread_form').find('input.add-new-member-users').val('');
  jQuery('.user_messaging_thread_form').find('div.add-new-member-markup').html(''); 
  var element = jQuery('.user_messaging_thread_form').find('div.m6message-main-container');
  if(element.hasClass('opacity02')){
    element.removeClass('opacity02');
  }
  });
  
  jQuery(document).on('click','.user_messaging_thread_form div.emojionearea-upbutton',function() {
  jQuery(document).find('.user_messaging_thread_form input.emoji-file-attachment').trigger('click');
  });

  jQuery(document).on('change','.user_messaging_thread_form input.emoji-file-attachment',function(){
  jQuery(document).find('.user_messaging_thread_form input.m6message_attachment_send').trigger('mousedown');
  }); 
  
  jQuery(document).on('click','.user_messaging_thread_form div.emojionearea-sendbutton',function(){
    var formDataValues = jQuery('.user_messaging_thread_form').serialize();
    jQuery('.user_messaging_thread_form').find('div.emojionearea.text-message-smilly div.emojionearea-editor').html('');
    jQuery('.user_messaging_thread_form').find('textarea.text-message-smilly').val('');
    jQuery.post( "/m6message-insert-message",{formDataValues:formDataValues }).done(function(data){
    M6MessagingRefresh(data.insert);

    var tofromusernames = jQuery('.m6messaging-tofromnames').val();
    // if (myobj !== undefined) {
    if (tofromusernames != '') {
      // Generating a json and Sending sockets.
      var tofromusernames_split = tofromusernames.split(':');
      var fromusername = tofromusernames_split[0];
      var tousername = tofromusernames_split[1].split(',');
      var myobj = [{'fromusername':fromusername, 'tousername':tousername}];
      socket_messaging.emit("messageService_broadcast", JSON.stringify(myobj));
    }

    }).always(function() {
      jQuery('.user_messaging_thread_form').find('div.emojionearea.text-message-smilly div.emojionearea-editor').html('');
      jQuery('.user_messaging_thread_form').find('textarea.text-message-smilly').val('');
    });
  });
  
  jQuery(document).on('keypress','.user_messaging_thread_form div.emojionearea.text-message-smilly .emojionearea-editor',function (e) {
  var keycode = (event.keyCode ? event.keyCode : event.which);    
  if(keycode === 13 && !e.shiftKey){
    e.preventDefault();
    jQuery('.user_messaging_thread_form').find('textarea.text-message-smilly').val(jQuery(this).html());
    var formDataValues = jQuery('.user_messaging_thread_form').serialize();
    jQuery('.user_messaging_thread_form').find('div.emojionearea.text-message-smilly div.emojionearea-editor').html('');
    jQuery('.user_messaging_thread_form').find('textarea.text-message-smilly').val('');
    jQuery.post( "/m6message-insert-message",{formDataValues:formDataValues }).done(function(data){
    M6MessagingRefresh(data.insert);

    // var myobj = Drupal.settings.m6connect_company.socket_names;
    var tofromusernames = jQuery('.m6messaging-tofromnames').val();
    // if (myobj !== undefined) {
    if (tofromusernames != '') {
      // Generating a json and Sending sockets.
      var tofromusernames_split = tofromusernames.split(':');
      var fromusername = tofromusernames_split[0];
      var tousername = tofromusernames_split[1].split(',');
      var myobj = [{'fromusername':fromusername, 'tousername':tousername}];
      socket_messaging.emit("messageService_broadcast", JSON.stringify(myobj));
    }

    }).always(function() {
      jQuery('.user_messaging_thread_form').find('div.emojionearea.text-message-smilly div.emojionearea-editor').html('');
      jQuery('.user_messaging_thread_form').find('textarea.text-message-smilly').val('');
    });
    return false;
  }
  });
  
  jQuery(document).ajaxSend(function (event, XMLHttpRequest, ajaxOptions) {
   var urlajax = ajaxOptions.url;
   if((urlajax.indexOf("/system/ajax")===0) && ajaxOptions.hasOwnProperty("extraData")){
     if(ajaxOptions.extraData.hasOwnProperty("_triggering_element_value") && ajaxOptions.extraData._triggering_element_value==="Refresh"){
     
     }else if(ajaxOptions.extraData.hasOwnProperty("_triggering_element_name") &&ajaxOptions.extraData._triggering_element_name==="connected-user-select"){
     //console.log(ajaxOptions.extraData);
     jQuery("div.user-connected-user.m6message-full-overlay").addClass("opacity02");
     jQuery("div.div.m6message-main-container").removeClass("opacity02");
     jQuery(".user_messaging_thread_form").find("div.add-new-group-container-section").hide();
     refreshMessageFlag = 0;  
     }
   } 
  }).ajaxComplete(function (event, XMLHttpRequest, ajaxOptions) {
   var urlajax = ajaxOptions.url;
   if((urlajax.indexOf("/system/ajax")===0) && ajaxOptions.hasOwnProperty("extraData") && ajaxOptions.extraData.hasOwnProperty("_triggering_element_value")){
     if(ajaxOptions.extraData.hasOwnProperty("_triggering_element_value") && ajaxOptions.extraData._triggering_element_value==="Refresh"){
     //setTimeout(refreshMessageContent, 10000);  
     }else if(ajaxOptions.extraData.hasOwnProperty("_triggering_element_name") &&ajaxOptions.extraData._triggering_element_name==="connected-user-select"){
     //console.log(ajaxOptions.extraData);
     jQuery("div.user-connected-user.m6message-full-overlay").removeClass("opacity02");
     jQuery("div.div.m6message-main-container").removeClass("opacity02");
     refreshMessageFlag = 1; 
     //setTimeout(refreshMessageContent, 10000); 
     }
    }
  });
});

