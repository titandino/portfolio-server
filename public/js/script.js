'use strict';

(function(ctx) {
  var numRendered = 0;
  Project.projects = [];

  function Project(data) {
    if (typeof data === 'object') {
      for (let field in data) {
        this[field] = data[field];
      }
    } else {
      console.log('Error loading Project.', data);
    }
  }

  Project.prototype.render = function() {
    let template = Handlebars.compile($('#project-template').html());
    $('.project-display').append(template(this));
    return this;
  };

  function initNav() {
    $('.section-toggle').on('click', function(e) {
      e.preventDefault();
      $('.tab-section').hide();
      $('#' + $(this).data('tab')).fadeIn(500);
    });
    $('.section-toggle:first').trigger('click');
  };

  function checkShowMoreHide() {
    if (numRendered >= Project.projects.length)
      $('#show-more').hide();
  }

  function initShowMore() {
    $('#show-more').on('click', () => renderProjects(4));
    checkShowMoreHide();
  };

  Project.preloadProjects = function(callback) {
    Project.projects = [];
    $.getJSON('/api/projects', function(data) {
      for(let i = 0;i < data.length;i++) {
        Project.projects[i] = new Project(data[i]);
        $('.edit-selection').append('<option data-idx=' + i + '>' + Project.projects[i].name + '</option>');
      }
    }).success(function() {
      if (callback)
        callback(4);
    });
  };

  function renderProjects(amount) {
    for(let i = 0;i < amount;i++) {
      if ((numRendered + i) >= Project.projects.length)
        continue;
      Project.projects[numRendered + i].render();
    }
    numRendered += amount;
    checkShowMoreHide();
  };

  function initGithubStats() {
    $.getJSON('/github/user', function(data) {
      $('#repo-count').text(data.public_repos);
    });
  }

  $(function() {
    initNav();
    initShowMore();
    initGithubStats();
    Project.preloadProjects(renderProjects);
  });

  ctx.Project = Project;
})(window);
