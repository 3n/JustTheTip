JustTheTip
==========

Highly customizable Tool-tip class that allows for arbitrary and dynamic tip
HTML and provides lots of events to hook into for tip showing/hiding/placement.

Each instance of JustTheTip creates only one element and positions it
absolutely. You can use the events to change the HTML of the tip based on the 
element that is being interacted with. The interaction defaults to mouseenter
but this is configurable. 

You can either pass in a selector or an elements array to specify which elements
will get tooltips, or you can pass in just one element (even document.body) 
and use Event.Delegation to specify which elements get tips. The latter approach
is much more efficient as it adds only one event. 

You can add elements to a given JustTheTip instance whenever you want.

You can also turn tips on/off for a given element at your discretion. 

![Screenshot](http://idisk.me.com/iancollins/Public/Pictures/Skitch/Picture_1-20091011-143400.png)

How to use
----------

It's easiest to just show examples of what you can do, so I'll start with a 
basic one:

	#JS
	new JustTheTip('.needs-tip', { 
		tip_html   : 'You will never see this.',
		show_delay : 0,
		hide_delay : 100,
		fade_in_duration  : 500,
		fade_out_duration : 1000,
		position: {position: 'bottomLeft'},
			
		onTipShown: function(tip,elem,jtt){
				tip.set('html', elem.get('html') + " tip");
		}
	});
	
This instance of JustTheTip will cause the following to happen: All elements with 
the class 'needs-tip', when mouseenter'd, will get a tooltip at their bottom-left
whose contents are the same as the hovered element, plus " tip". The tip will 
start to fade in immediately, but will start to fade out only after the mouse has 
left the tip & element for 100 miliseconds.

Let's look at an example that uses Event.Delegate:

	#JS
	new JustTheTip($('article_body'), {
    tip_html   : "<a class='tip-preview-link'>preview</a>",
		tip_class  : 'article-link-tip',
		show_delay : 100,
		show_event : 'mouseover:relay(a.wikilink)',
		position: {position: 'centerRight', edge: 'centerLeft', offset: {x: 20, y: 30}},
		           
    onTipShown: function(tip,elem,jtt){
      tip.getFirst('.tip-preview-link').set('href', elem.get('href') + '/preview')
    }
  });

This instance will make a tip, with initial html/class as specified, show after
the user has mouseover'd an anchor tag with the class 'wikilink' for 100 miliseconds 
within the element #article_body. When it is shown the link inside the tip will
get an href based on the mouseover'd element. The center left side of the tip will
be placed against the center right of the element with the given offsets.

For a demo of this an other tips, check http://www.bing.com/reference/semhtml/Achewood
and hover over some links in the article. The first tip is what you see above, which
has its own tip whose content is loaded with a Request. 


Full documentation below:

Sytax
-----

	new JustTheTip(elements, [options])
	
Arguments
---------

	1. element - (mixed) An Element, an array of Elements or a CSS Selector.
	2. options - (object, optional) the options described below:

Options
-------

  * show_delay : (number) Delay before tip is shown. Defaults to 400.
  * hide_delay : (number) Delay before tip is hidden. Defaults to 200.
  * show_event : (string/array of strings) Element.Event(s) that shows the tip. Defaults to 'mouseenter'.
  * hide_event : (string/array of strings) Element.Event(s) that hides the tip. Defaults to 'mouseleave'.
  * tip_html   : (string) HTML to give tip element on creation. Defaults to ''.
  * tip_class  : (string) Class to give tip element on creation. Defaults to 'tip'.
  * tip_enter  : (string/array of strings) Element.Event(s) that signals the mouse has entered the tip. 
								 Defaults to 'mouseenter'.
  * tip_leave  : (string/array of strings) Element.Event(s) that signals the mouse has left the tip. 
								 Defaults to 'mouseleave'.
  * fade\_in\_duration : (number) Duration of fade in Defaults to 0.
  * fade_out\_duration : (number) Duration of fade out Defaults to 0.
  * position : (string or object) Position of the tip relative to its element. A string that follows 
							 the conventions of Element.Position. If you wish to specify the position and the edge, 
							 pass an object with both key/value pairs. Defaults to { 'position': 'upperRight', 'edge': 'upperLeft' }.

Events
------

  * tipInjected : The function to execute when the tip element is created and injected into the document.
									Gets passed the tip element and the instance of JustTheTip.
  * tipShown    : The function to execute when the tip element is shown. 
								  Gets passed the tip element, the element that triggered the showing, and the instance of
									JustTheTip
  * tipHidden   : The function to execute when the tip element is hidden.
								  Gets passed the tip element, the element that triggered the showing, and the instance of
									JustTheTip
									
Screenshots
-----------

Tip that opens immediately above the clicked element (image enlarging)

![Screenshot](http://idisk.me.com/iancollins/Public/Pictures/Skitch/Picture_2-20091011-143804.png)
