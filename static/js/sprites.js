//This script draws sprites from spritesheet
// Artists draw sprites with a draw(sprite, context) method. ImageArtists
// draw an image for their sprite.


SpriteFromSheet=function(spritesheet, cells){
	this.cells=cells;
	this.spritesheet=spritesheet;
	this.cell_index=0;
}

SpriteFromSheet.prototype={
	
	NextCell:function(){
		if(this.cell_index==this.cells.length-1){
			this.cell_index=0;
		}
		else{
			this.cell_index++;
		}
	},
	
	Draw:function(sprite, context){
		var cell=this.cells[this.cell_index];
		//cell-arvot: mitkä arvot on spritesheetissä
		context.drawImage(this.spritesheet,cell.x,cell.y,cell.width,cell.height,sprite.x,sprite.y,cell.width,cell.height);
	}
}

// Sprite Animators...........................................................

var SpriteAnimator=function(cells,duration,aftereffect){
   this.cells=cells;
   this.duration=duration||1000;
   this.after=aftereffect;
};

SpriteAnimator.prototype={
	Start:function(sprite,reappear){
		var original_cells=sprite.mode.cells,
			original_index=sprite.mode.cell_index,
		  	self=this;
	
		sprite.mode.cells=this.cells;
		sprite.mode.cell_index=0;
	  
		setTimeout(function(){
			sprite.mode.cells=original_cells;
			sprite.mode.cell_index=original_index;
			sprite.visible = reappear;
			if(self.after){
				self.after(sprite, self);
			}
		},self.duration);
	},
};

var Sprite=function(type, mode, behaviors) {
	//Jos ei anneta argumenttejä niin defaultit:
    this.type=type || '';
    this.mode=mode || undefined;
    this.behaviors=behaviors || [];
	
    this.x=0;
    this.y=0;
    this.width=40;
    this.height=40;
	this.velocityX=0;
	this.velocityY=0;
	this.opacity=1.0;
    this.visible=true;
	this.collided=false;

    return this;
}

Sprite.prototype={
	Draw:function(context){
		context.save();
		context.globalAlpha = this.opacity;
		if(this.mode && this.visible){
			this.mode.Draw(this, context);
		}
		context.restore();
	},
	
	Update:function(context,time,fps){
		for(var n=0; n<this.behaviors.length; ++n){
			if(this.behaviors[n]!=undefined){
				this.behaviors[n].Execute(this,context,time,fps);
		 	}
		}
	}
};
