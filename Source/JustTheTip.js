/*
--- 
name: JustTheTip
script: JustTheTip.js
description: Tool-tip class that allows for arbitrary HTML and provides lots of events to hook into.

authors: 
  - 3n

provides: 
  - JustTheTip

requires: 
  - More/Class.Binds
  - More/Element.Position
  - Core/Class.Extras
  - Core/Element.Event
  - Core/Element.Style
  - Core/Selectors
  
license: MIT-style

...
*/

var JustTheTip = new Class({
	Implements: [Options, Events],
  Binds: ['hide_tip'],
	
	options : {
		show_delay : 400,
		hide_delay : 200,
		z_index    : 100,
		show_event : 'mouseenter',
		hide_event : 'mouseleave',
		tip_html   : '',
		tip_class  : 'tip',
		tip_enter  : 'mouseenter',
		tip_leave  : 'mouseleave',
		fade_in_duration  : 0,
		fade_out_duration : 0,
		click_away_hide : false,
    position : { 'position': 'upperRight', 'edge': 'upperLeft' },
    shouldShowTip: function(elem){
      return true;
    }
	},
	
	initialize: function(elements, options){
		this.setOptions(options);
		this.elements = elements;

		this.the_tip = new Element('div', {
			'class' 	: this.options.tip_class,
			'styles' 	: {
				'display' 	: 'none',
				'position' 	: 'absolute',
				'top' 			: 0,
				'left' 			: 0,
				'z-index'   : this.options.z_index
			}
		}).inject(document.body)
			.set('html', this.options.tip_html);
			
		this.fireEvent('onTipInjected', [this.the_tip, this]);

		[this.options.tip_enter].flatten().each(function(te){
			this.the_tip.addEvent(te, this._tip_enter.bind(this));
		}, this);
		[this.options.tip_leave].flatten().each(function(tl){
			this.the_tip.addEvent(tl, this._tip_leave.bind(this));
		}, this);
		
		this.is_it_in_yet = false;
		this.attach_events();
		
		return this;
	},
	
	attach_events: function(elements){
	  var elements = elements || this.elements;
		$$(elements).each(function(elem){
			elem.store('just_the_tip_on', true);
			[this.options.show_event].flatten().each(function(se){
			  var events_obj = {}, callback;
				if (se.match(/relay\(/)){
          var thiz = this;
          callback = function(){
             this.store('just_the_tip_on', true);
             thiz.show_tip(this);
           };
				} else
				  callback = this.show_tip.bind(this, elem);
				
				elem.addEvent(se, callback);
				events_obj[se] = callback;
			  elem.store('just-the-tip-events', $merge(elem.retrieve('just-the-tip-events') || {}, events_obj));					
			}, this);
		}.bind(this));

		this._click_away = function(e){
		  if (this._is_tip_shown() && e.target != this.the_tip && !$(e.target).getParents().contains(this.the_tip)){
	      this.hide_tip();
	    }
		}.bind(this);
	},
	detach_events: function(elements){
	  var elements = elements || this.elements;
	  $$(elements).each(function(elem){
      $each(elem.retrieve('just-the-tip-events'), function(v,k){
        elem.removeEvent(k,v);
      });
		}.bind(this));
		
		if (this.options.click_away_hide){
		  $(document.body).removeEvent('click', this._click_away);
		}
	},
	
	_get_position: function(){
	  if ($type(this.options.position) == 'string')
	    return {position: this.options.position};
	  else
	    return this.options.position;
	},
	
	_is_tip_shown: function(){
	  return this.the_tip && this.the_tip.getStyle('display') != 'none';
	},
	_show_tip: function(){
	  this.the_tip.setStyle('display', 'block');
	},
	show_tip: function(elem){
	  if (!this.options.shouldShowTip(elem)) return;
	  if (elem == this.current_element && this._is_tip_shown()) return;
	  
	  if (elem != this.current_element && this._is_tip_shown()){
	    this.hide_tip();
	  }
	  
		this.current_element = elem;
		[this.options.hide_event].flatten().each(function(he){
			this.current_element.addEvent(he, this.hide_tip);
		}, this);
				
		$clear(this.timer);
		this.timer = (function(){
			if (elem.retrieve('just_the_tip_on')){
				this.fireEvent('tipShown', [this.the_tip, this.current_element, this]);
				if (Element.fade){
				  this.the_tip.fade('hide');
          this.the_tip.set('tween', {
            duration   : this.options.fade_in_duration,
            onStart    : this._show_tip.bind(this)
          }).fade('in');
				} else
				  this._show_tip();
        this.the_tip.position( $merge({relativeTo: elem, ignoreScroll: true}, this._get_position()) );        

        if (this.options.click_away_hide){
          $(document.body).addEvent.delay(1, $(document.body), ['click', this._click_away]);
    		}
			}
		}).delay(this.options.show_delay, this);
	},	
	_hide_tip: function(){
	  this.the_tip.setStyle('display','none');
    this.fireEvent('tipHidden', [this.the_tip, this.current_element, this]);
	},
	hide_tip: function(){
		$clear(this.timer);
		this.timer = (function(){
			if (!this.is_it_in_yet) {				
				[this.options.hide_event].flatten().each(function(he){
					this.current_element.removeEvent(he, this.hide_tip);
				}, this);

        if (Element.fade){
          this.the_tip.set('tween', {
            duration   : this.options.fade_out_duration,
            onComplete : this._hide_tip.bind(this)
          }).fade('out');		
        } else
          this._hide_tip();
			}
		}).delay(this.options.hide_delay, this);
		
		if (this.options.click_away_hide){
		  $(document.body).removeEvent('click', this._click_away);
		}
	},
	
	add_element: function(elem){
	  this.attach_events(elem);
	  return this;
	},
	
	turn_tips_on: function(elem){
	  var elem = elem || this.elements;
	  elem.store('just_the_tip_on', true);
	},
	turn_tips_off: function(elem){
	  var elem = elem || this.elements;
	  elem.store('just_the_tip_on', false);
	},
	
	_tip_enter: function(){
		this.is_it_in_yet = true;
	},
	_tip_leave: function(){
		this.is_it_in_yet = false;
		this.hide_tip();
	}
});