'use strict';

(function() {
  let template = Handlebars.compile($('#project-template').html());

  function isLoggedIn() {
    if (localStorage.access_token && parseInt(localStorage.token_expiry) > Date.now()) {
      return true;
    }
    return false;
  }

  // let refreshOptions = function() {
  //   $('.edit-selection').first().siblings().remove();
  //   for (let i = 0;i < Project.projects.length;i++) {
  //     $('.edit-selection').append('<option data-idx=' + i + '>' + Project.projects[i].name + '</option>');
  //   }
  // };

  function refreshProjects() {
    //Project.preloadProjects(refreshOptions);
    document.location.reload(false); //temporary until I can clean the hell out of this admin.js mess
  }

  function initLoginForm() {
    $('.form-login').on('submit', function(e) {
      $('.form-login').attr('disabled', true);
      e.preventDefault();
      ajax('POST', '/api/login', $(this).serialize(), function(res) {
        if (res) {
          if (res.success) {
            localStorage.access_token = res.token;
            localStorage.token_expiry = res.expiresIn;
            initNavTabs();
          } else {
            displayLoginResult(res.message);
          }
        } else {
          displayLoginResult('Failed to retrieve token from API.');
        }
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
      ajax('POST', '/api/projects', formToJSON($(this)), function(msg) {
        console.log('POST');
        console.log(msg);
        if (msg) {
          $('.form-add-project').trigger('reset');
          refreshProjects();
        }
        $('.form-add-project').attr('disabled', true);
        $('.add-result').text(msg);
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
      if (confirm('Are you sure you want to delete this project?')) {
        ajax('DELETE', '/api/projects/' + id, { }, function(msg) {
          console.log('DELETE');
          console.log(msg);
          if (msg.includes('Successfully')) {
            $('.form-edit-project').trigger('reset');
            refreshProjects();
          }
          $('#deleteButton').attr('disabled', false);
          $('.form-edit-project').attr('disabled', false);
          $('.edit-result').text(msg);
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
      ajax('PUT', '/api/projects/' + data._id, data, function(msg) {
        console.log('PUT');
        console.log(msg);
        if (msg._id == data._id) {
          $('.form-edit-project').trigger('reset');
          refreshProjects();
        }
        $('.form-edit-project').attr('disabled', false);
        $('.edit-result').text(msg);
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
    $.ajax({ type: type, url: url, headers: { 'x-access-token': localStorage.access_token }, data: data, success: callback });
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
})();
