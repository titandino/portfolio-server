'use strict';

(function(ctx) {

  let template = Handlebars.compile($('#project-template').html());

  function isLoggedIn() {
    if (localStorage.access_token && parseInt(localStorage.token_expiry) > Date.now()) {
      return true;
    }
    return false;
  }

  function addToken(dater) {
    if (typeof dater == 'string') {
      dater += '&token=' + localStorage.access_token;
    } else if (typeof dater == 'object') {
      dater.token = localStorage.access_token;
    }
    return dater;
  }

  let refreshOptions = function() {
    $('.edit-selection').first().siblings().remove();
    for (let i = 0;i < Project.projects.length;i++) {
      $('.edit-selection').append('<option data-idx=' + i + '>' + Project.projects[i].name + '</option>');
    }
  };

  function refreshProjects() {
    //Project.preloadProjects(refreshOptions);
    document.location.reload(false); //temporary until I can clean the hell out of this admin.js mess
  }

  function initLoginForm() {
    $('.form-login').on('submit', function(e) {
      $('.form-login').attr('disabled', true);
      e.preventDefault();
      let data = $(this).serialize();
      $.post('http://trentonkress.com/api/login', data, function(res) {
        if (res) {
          if (res.success) {
            localStorage.access_token = res.token;
            localStorage.token_expiry = res.expiresIn;
            console.log(localStorage.access_token);
            initNavTabs();
          } else {
            displayLoginResult(res.message);
          }
        } else {
          displayLoginResult('Failed to retrieve token from API.');
        }
      }, 'json').fail(function() {
        displayLoginResult('Failed to connect to API.');
      });
    });
  }

  function displayLoginResult(message) {
    $('.form-login').attr('disabled', false);
    $('.login-result').text(message);
  }

  function initAddForm() {
    $('.form-add-project').on('submit', function(e) {
      e.preventDefault();
      $('.form-add-project').attr('disabled', true);

      let data = formToJSON($(this));

      $.ajax({
        type: 'POST',
        url: 'http://trentonkress.com/api/projects',
        data: addToken(data),
        success: function(msg) {
          if (msg.includes('Successfully')) {
            $('.form-add-project').trigger('reset');
            refreshProjects();
          }
          $('.form-add-project').attr('disabled', true);
          $('.add-result').text(msg);
        }
      });
    });
    $('.form-add-project').on('change', function() {
      $('.add-project-preview').empty();
      $('.add-project-preview').append(template(formToJSON($(this))));
    });
  }

  function formToJSON(form) {
    let data = {};
    form.serializeArray().map(function(x) {
      data[x.name] = x.value;
    });
    return data;
  }

  function deleteProject() {
    let id = $('.form-edit-project input:first-child').val();
    if (id) {
      let data = { projId:id };
      if (confirm('Are you sure you want to delete this project?')) {
        $.ajax({
          type: 'DELETE',
          url: 'http://trentonkress.com/api/projects',
          data: addToken(data),
          success: function(msg) {
            if (msg.includes('Successfully')) {
              $('.form-edit-project').trigger('reset');
              refreshProjects();
            }
            $('#deleteButton').attr('disabled', false);
            $('.form-edit-project').attr('disabled', false);
            $('.edit-result').text(msg);
          }
        });
      }
    } else {
      $('.edit-result').text('No project selected to delete.');
    }
  }

  function initEditForm() {
    $('#deleteButton').on('click', function() {
      deleteProject();
    });
    $('.form-edit-project').on('submit', function(e) {
      e.preventDefault();
      $('.form-edit-project').attr('disabled', true);

      let data = formToJSON($(this));
      data._id = $('.form-edit-project input:first-child').val();
      $.ajax({
        type: 'PUT',
        url: 'http://trentonkress.com/api/projects',
        data: addToken(data),
        success: function(msg) {
          if (msg.includes('Successfully')) {
            $('.form-edit-project').trigger('reset');
            refreshProjects();
          }
          $('.form-edit-project').attr('disabled', false);
          $('.edit-result').text(msg);
        }
      });
    });
    $('.edit-selection').on('change', function() {
      var project = Project.projects[$(this).find('option:selected').data('idx')];
      for (let key in project) {
        if (project.hasOwnProperty(key))
          $('.form-edit-project input[name=' + key + ']').val(project[key]);
      }
      $('.form-edit-project input[name=projId]').val(project._id);
      $('.edit-project-preview').empty();
      $('.edit-project-preview').append(template(formToJSON($('.form-edit-project'))));
    });
  }

  function initNavTabs() {
    $('.section-toggle').on('click', function(e) {
      e.preventDefault();
      $('.admintab-section').hide();
      $('#' + $(this).data('tab')).fadeIn(500);
    });
    $('.section-toggle:first').trigger('click');
  }

  function displayLogin() {
    $('.admintab-section').hide();
    $('#login-section').show();
    initLoginForm();
  }

  function ajax(type, url, data, callback) {
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState == 4 || request.readyState == 200) {
        callback(request.responseText);
      }
    };
    request.open(type, url, true);
    request.send(data);
  }

  function initAdminPage() {
    initNavTabs();
    initAddForm();
    initEditForm();
  }

  function checkLogin() {
    if (isLoggedIn()) {
      initAdminPage();
    } else {
      displayLogin();
    }
  }

  $(function() {
    checkLogin();
  });
})(window);
