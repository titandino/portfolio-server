(function(ctx) {
  function handleSearchButton() {
    $('.highscores-search').on('submit', function(e) {
      e.preventDefault();
      requestHighscoreData($('.highscores-search input').val());
    });
  }

  function requestHighscoreData(username) {
    $.getJSON('/rs/highscores/' + username, function(data) {
      console.log(data);
      if (data) {
        formatAndDisplayHighscores(data, username);
      } else {
        $('#hs-info').text('Player not found.');
      }
    });
  }

  function formatAndDisplayHighscores(data, username) {
    reset();
    $('#player-name').text('Showing stats for "' + username + '"');
    $('#results-div').append('<table></table>');
    $('#results-div table').append('<tr><th>Skill</th><th>Rank</th><th>Level</th><th>Experience</th></tr>');
    for (skill in data) {
      let row = $('<tr></tr>');
      row.append('<td><img src="' + data[skill].skillIcon + '" title="' + data[skill].skillName + '"/></td>');
      row.append('<td>' + data[skill].rank.toLocaleString() + '</td>');
      row.append('<td>' + data[skill].level + '</td>');
      row.append('<td>' + data[skill].xp.toLocaleString() + '</td>');
      $('#results-div table').append(row);
    }
  }

  function reset() {
    $('#hs-info').text('');
    $('#results-div').empty();
  }

  $(function() {
    handleSearchButton();
    requestHighscoreData('yehp');
  });
})(window);
