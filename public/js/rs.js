(function(ctx) {
  function handleSearch() {
    $('.highscores-search').on('submit', function(e) {
      e.preventDefault();
      $.getJSON('/rs/highscores/' + $('.highscores-search input').val(), function(data) {
        console.log(data);
        if (data) {
          formatAndDisplayHighscores(data);
        } else {
          $('#hs-info').text('Player not found.');
        }
      });
    });
  }

  function formatAndDisplayHighscores(data) {
    reset();
    $('#results-div').append('<h2>' + $('.highscores-search input').val() + '</h2>');
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
    handleSearch();
  });
})(window);
