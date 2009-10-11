/*=
name: JustTheTip
description: Tool-tip class that allows for arbitrary HTML and provides lots of events to hook into.
@requires more/1.2.3 Class.Binds Element.Position
@requires core/1.2.3 Class.Extras Element.Event Element.Style Selectors
@provides JustTheTip
=*/

var JustTheTip = new Class({
	Implements: [Options, Events],
  Binds: ['hide_tip'],
	
	options : {
		show_delay : 400,
		hide_delay : 200,
		show_event : 'mouseenter',
		hide_event : 'mouseleave',
		tip_html   : '',
		tip_class  : 'tip',
		tip_enter  : 'mouseenter',
		tip_leave  : 'mouseleave',
		fade_in_duration  : 0,
		fade_out_duration : 0,
    position : { 'position': 'upperRight', 'edge': 'upperLeft' }
	},
	
	initialize: function(elements, options){
		this.setOptions(options);

		this.the_tip = new Element('div', {
			'class' 	: this.options.tip_class,
			'styles' 	: {
				'display' 	: 'none',
				'position' 	: 'absolute',
				'top' 			: 0,
				'left' 			: 0,
				'z-index'   : 100
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
		this.attach_events(elements);
		
		return this;
	},
	
	attach_events: function(elements){
		var show_event = this.options.show_event;
		var hide_event = this.options.hide_event;
		
		$$(elements).each(function(elem){
			elem.store('just_the_tip_on', true);
			[this.options.show_event].flatten().each(function(se){
				if (se.match(/relay\(/)){
					var thiz = this;
					elem.addEvent(se, function(){
						this.store('just_the_tip_on', true);
						thiz.show_tip(this);
					});
				}	else
					elem.addEvent(se, this.show_tip.bind(this, elem));
			}, this);
		}.bind(this));
	},
	
	_get_position: function(){
	  if ($type(this.options.position) == 'string')
	    return {position: this.options.position};
	  else
	    return this.options.position;
	},
	
	show_tip: function(elem){
		this.current_element = elem;
		[this.options.hide_event].flatten().each(function(he){
			this.current_element.addEvent(he, this.hide_tip);
		}, this);
		
		$clear(this.timer);
		this.timer = (function(){
			if (elem.retrieve('just_the_tip_on')){
        this.the_tip.position( $merge({relativeTo: elem}, this._get_position()) );
				this.fireEvent('tipShown', [this.the_tip, this.current_element, this]);
        this.the_tip.fade('hide');
        this.the_tip.set('tween', {
          duration   : this.options.fade_in_duration,
          onStart    : function(){ this.the_tip.setStyle('display', 'block'); }.bind(this)
        }).fade('in');
			}
		}).delay(this.options.show_delay, this);
	},	
	hide_tip: function(){
		$clear(this.timer);
		this.timer = (function(){
			if (!this.is_it_in_yet) {				
				[this.options.hide_event].flatten().each(function(he){
					this.current_element.removeEvent(he, this.hide_tip);
				}, this);

        this.the_tip.set('tween', {
          duration   : this.options.fade_out_duration,
          onComplete : function(){ 
            this.the_tip.setStyle('display','none');
            this.fireEvent('tipHidden', [this.the_tip, this.current_element, this]);
          }.bind(this)
        }).fade('out');		
			}
		}).delay(this.options.hide_delay, this);
	},
	
	add_element: function(elem){
	  this.attach_events(elem);
	  return this;
	},
	
	turn_tips_on: function(elem){
		elem.store('just_the_tip_on', true);
	},
	turn_tips_off: function(elem){
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
