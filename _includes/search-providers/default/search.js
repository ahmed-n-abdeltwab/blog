var SOURCES = window.TEXT_VARIABLES.sources;
var PAHTS = window.TEXT_VARIABLES.paths;
window.Lazyload.js([SOURCES.jquery, PAHTS.search_js], function() {
  var search = (window.search || (window.search = {}));
  var searchData = window.TEXT_SEARCH_DATA ? initData(window.TEXT_SEARCH_DATA) : {};

  function memorize(f) {
    var cache = {};
    return function () {
      var key = Array.prototype.join.call(arguments, ',');
      if (key in cache) return cache[key];
      else return cache[key] = f.apply(this, arguments);
    };
  }

  function initData(data) {
    var _data = [], i, j, key, keys, cur;
    keys = Object.keys(data);
    for (i = 0; i < keys.length; i++) {
      key = keys[i], _data[key] = [];
      for (j = 0; j < data[key].length; j++) {
        cur = data[key][j];
        cur.title = window.decodeUrl(cur.title);
        cur.url = window.decodeUrl(cur.url);
        cur.content = cur.content ? window.decodeUrl(cur.content) : '';
        _data[key].push(cur);
      }
    }
    return _data;
  }

  /// Highlight matching terms in text
  function highlightMatches(text, query) {
    if (!text || !query) return text;
    var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /// Extract excerpts around all search term occurrences
  function getExcerpts(content, query, maxExcerpts) {
    if (!content) return [];
    var lowerContent = content.toLowerCase();
    var lowerQuery = query.toLowerCase();
    var excerpts = [];
    var positions = [];
    var index = 0;
    
    // Find all occurrences
    while ((index = lowerContent.indexOf(lowerQuery, index)) !== -1) {
      positions.push(index);
      index += lowerQuery.length;
      if (positions.length >= maxExcerpts) break;
    }
    
    if (positions.length === 0) {
      return [{
        text: highlightMatches(content.substring(0, 160) + '...', query),
        position: 0
      }];
    }
    
    // Create excerpts for each occurrence
    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      var start = Math.max(0, pos - 60);
      var end = Math.min(content.length, pos + query.length + 60);
      
      // Avoid overlapping excerpts
      if (i > 0 && start < positions[i-1] + query.length + 60) {
        continue;
      }
      
      var excerpt = (start > 0 ? '...' : '') + 
                    content.substring(start, end) + 
                    (end < content.length ? '...' : '');
      
      excerpts.push({
        text: highlightMatches(excerpt, query),
        position: pos,
        matchNumber: excerpts.length + 1
      });
    }
    
    return excerpts;
  }

  /// search
  function searchByQuery(query) {
    var i, j, key, keys, cur, _title, _content, result = {};
    keys = Object.keys(searchData);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      for (j = 0; j < searchData[key].length; j++) {
        cur = searchData[key][j], _title = cur.title, _content = cur.content || '';
        var titleMatch = _title.toLowerCase().indexOf(query.toLowerCase()) >= 0;
        var contentMatch = _content.toLowerCase().indexOf(query.toLowerCase()) >= 0;
        
        if ((result[key] === undefined || result[key] && result[key].length < 4 )
          && (titleMatch || contentMatch)) {
          if (result[key] === undefined) {
            result[key] = [];
          }
          var displayTitle = titleMatch ? highlightMatches(_title, query) : _title;
          var item = {
            title: displayTitle,
            url: cur.url,
            excerpt: contentMatch ? getExcerpts(_content, query, 3) : _content.substring(0, 160) + '...',
            matchInTitle: titleMatch
          };
          result[key].push(item);
        }
      }
    }
    return result;
  }

  var renderHeader = memorize(function(header) {
    return $('<p class="search-result__header">' + header + '</p>');
  });

  var renderItem = function(index, title, url, excerpts, query) {
    var $item = $('<li class="search-result__item" data-index="' + index + '"></li>');
    var $container = $('<div class="search-result__container"></div>');
    
    // Title link - opens post normally without highlight
    var $titleLink = $('<a class="search-result__title-link" href="' + url + '"></a>');
    var $title = $('<div class="search-result__title">' + title + '</div>');
    $titleLink.append($title);
    
    $container.append($titleLink);
    
    // Excerpt links - each match is separately clickable
    if (excerpts && excerpts.length > 0) {
      var $excerptsContainer = $('<div class="search-result__excerpts"></div>');
      
      for (var i = 0; i < excerpts.length; i++) {
        var excerpt = excerpts[i];
        var urlWithQuery = url + (url.indexOf('?') > -1 ? '&' : '?') + 
                          'highlight=' + encodeURIComponent(query) + 
                          '&match=' + excerpt.matchNumber;
        
        var $excerptItem = $('<div class="search-result__excerpt-item"></div>');
        var $excerptLink = $('<a class="search-result__excerpt-link" href="' + urlWithQuery + '"></a>');
        
        if (excerpts.length > 1) {
          var $matchBadge = $('<span class="search-result__match-badge">Match ' + excerpt.matchNumber + '</span>');
          $excerptLink.append($matchBadge);
        }
        
        var $excerpt = $('<div class="search-result__excerpt">' + excerpt.text + '</div>');
        $excerptLink.append($excerpt);
        $excerptItem.append($excerptLink);
        $excerptsContainer.append($excerptItem);
      }
      
      $container.append($excerptsContainer);
    }
    
    $item.append($container);
    
    return $item;
  };

  function render(data, query) {
    if (!data) { return null; }
    var $root = $('<ul></ul>'), i, j, key, keys, cur, itemIndex = 0;
    keys = Object.keys(data);
    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      $root.append(renderHeader(key));
      for (j = 0; j < data[key].length; j++) {
        cur = data[key][j];
        $root.append(renderItem(itemIndex++, cur.title, cur.url, cur.excerpt, query));
      }
    }
    return $root;
  }

  // search box
  var $result = $('.js-search-result'), $resultItems;
  var lastActiveIndex, activeIndex;

  var currentQuery = '';
  
  function clear() {
    $result.html(null);
    $resultItems = $('.search-result__item'); activeIndex = 0;
    currentQuery = '';
  }
  function onInputNotEmpty(val) {
    currentQuery = val;
    $result.html(render(searchByQuery(val), val));
    $resultItems = $('.search-result__item'); activeIndex = 0;
    $resultItems.eq(0).addClass('active');
  }

  search.clear = clear;
  search.onInputNotEmpty = onInputNotEmpty;

  function updateResultItems() {
    lastActiveIndex >= 0 && $resultItems.eq(lastActiveIndex).removeClass('active');
    activeIndex >= 0 && $resultItems.eq(activeIndex).addClass('active');
  }

  function moveActiveIndex(direction) {
    var itemsCount = $resultItems ? $resultItems.length : 0;
    if (itemsCount > 1) {
      lastActiveIndex = activeIndex;
      if (direction === 'up') {
        activeIndex = (activeIndex - 1 + itemsCount) % itemsCount;
      } else if (direction === 'down') {
        activeIndex = (activeIndex + 1 + itemsCount) % itemsCount;
      }
      updateResultItems();
    }
  }

  // Char Code: 13  Enter, 37  ⬅, 38  ⬆, 39  ➡, 40  ⬇
  $(window).on('keyup', function(e) {
    var modalVisible = search.getModalVisible && search.getModalVisible();
    if (modalVisible) {
      if (e.which === 38) {
        modalVisible && moveActiveIndex('up');
      } else if (e.which === 40) {
        modalVisible && moveActiveIndex('down');
      } else if (e.which === 13) {
        // Enter key - click the excerpt link (with highlight) if available, otherwise title link
        if (modalVisible && $resultItems && activeIndex >= 0) {
          var $item = $resultItems.eq(activeIndex);
          var $excerptLink = $item.find('.search-result__excerpt-link');
          var $titleLink = $item.find('.search-result__title-link');
          if ($excerptLink.length > 0) {
            $excerptLink[0].click();
          } else if ($titleLink.length > 0) {
            $titleLink[0].click();
          }
        }
      }
    }
  });

  $result.on('mouseover', '.search-result__item', function() {
    var itemIndex = $(this).data('index');
    itemIndex >= 0 && (lastActiveIndex = activeIndex, activeIndex = itemIndex, updateResultItems());
  });
});
