(function() {
  var SOURCES = window.TEXT_VARIABLES.sources;
  window.Lazyload.js(SOURCES.jquery, function() {
    $(function() {
      var $this ,$scroll;
      var $articleContent = $('.js-article-content');
      var hasSidebar = $('.js-page-root').hasClass('layout--page--sidebar');
      var scroll = hasSidebar ? '.js-page-main' : 'html, body';
      $scroll = $(scroll);

      $articleContent.find('.highlight').each(function() {
        $this = $(this);
        $this.attr('data-lang', $this.find('code').attr('data-lang'));
      });
      $articleContent.find('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').each(function() {
        $this = $(this);
        $this.append($('<a class="anchor d-print-none" aria-hidden="true"></a>').html('<i class="fas fa-anchor"></i>'));
      });
      $articleContent.on('click', '.anchor', function() {
        $scroll.scrollToAnchor('#' + $(this).parent().attr('id'), 400);
      });

      // Highlight search terms from URL parameter
      function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
      }

      function highlightAndScroll() {
        var searchTerm = getUrlParameter('highlight');
        if (!searchTerm) return;

        var matchNumber = parseInt(getUrlParameter('match')) || 1;
        
        // Escape special regex characters properly
        var escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create regex that handles multi-word phrases
        // Replace spaces with flexible whitespace matcher to handle line breaks and multiple spaces
        var regexPattern = escapedTerm.replace(/\s+/g, '\\s+');
        var regex = new RegExp('(' + regexPattern + ')', 'gi');
        
        var allMatches = [];
        var currentMatchCount = 0;

        // Find and highlight all text nodes
        function highlightTextNodes(node) {
          if (node.nodeType === 3) { // Text node
            var text = node.nodeValue;
            // Reset regex lastIndex for each text node
            regex.lastIndex = 0;
            if (regex.test(text)) {
              regex.lastIndex = 0; // Reset again before replace
              var span = document.createElement('span');
              span.innerHTML = text.replace(regex, function(match) {
                currentMatchCount++;
                return '<mark class="search-highlight" data-match="' + currentMatchCount + '">' + match + '</mark>';
              });
              node.parentNode.replaceChild(span, node);
              
              // Collect all marks
              var marks = span.querySelectorAll('mark');
              for (var i = 0; i < marks.length; i++) {
                allMatches.push(marks[i]);
              }
              
              return span;
            }
          } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'CODE') {
            // Create a copy of childNodes array since we'll be modifying the DOM
            var children = Array.prototype.slice.call(node.childNodes);
            for (var i = 0; i < children.length; i++) {
              highlightTextNodes(children[i]);
            }
          }
        }

        highlightTextNodes($articleContent[0]);

        // Scroll to the specified match (or first if not specified)
        var targetMatch = allMatches[matchNumber - 1] || allMatches[0];
        if (targetMatch) {
          // Add special styling to the target match
          $(targetMatch).addClass('search-highlight--target');
          
          setTimeout(function() {
            var offset = $(targetMatch).offset().top - 100;
            $scroll.animate({ scrollTop: offset }, 600);
          }, 300);
        }
      }

      highlightAndScroll();
    });
  });
})();
