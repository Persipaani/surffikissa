//Sampo's cat game

//Game-object:
var Game=function(){
	//elements:
	this.canvas = document.getElementById("game-canvas"),
	this.context = this.canvas.getContext("2d"),
	this.msg = document.getElementById("msg"),

	
	//general:
	this.platform_height=3,
	this.platform_width=2,
	this.colorstyle="rgb(0,0,0)",
	//Alin mahdollinen:400 Ylin mahdollinen:0 
	this.height1=360,
	this.height2=225,
	this.height3=85,
	
	this.scroll_speed=42,
	this.current_track=2,
	this.sprite_speed=0,
	this.background_speed=0,
	this.player_acc=0.0,
	
	//offsets:
	this.background_offset=0,
	
	//timing:
	this.prev_time=0,
	this.prev_update=0,
	this.fps=60,
	this.paused=false,
	this.pause_start=0,
	this.pausetimer=200,
	this.window_active=true,
	
	//items:
	this.background  = new Image(),
	this.spritesheet = new Image(),
	
	//other:
	this.right_up=true,
	this.left_up=true,
	this.breath=40.0,
	this.completion=0.0,
	this.partial_completion=0,
	this.breath_bar_color="rgb(0,25,200)",
	this.completion_bar_color="rgb(200,25,0)",
	this.keypaused=false,
	this.collision_duration=1000;
	this.lost=false;
	this.won=false;
	
	//Sprite locations:
	//Tässä vaiheessa vasta 1 cell kaikkia, koska ei animointia!
	this.playercells=[{x:0,y:0,width:50,height:45}],
	this.dogcells=[{x:0,y:50,width:45,height:50}],
	this.dogdata=[{x:1200,y:this.height2},{x:1300,y:this.height3},{x:1500,y:this.height2},{x:1700,y:this.height3},
	{x:1750,y:this.height3},{x:1200,y:this.height3},{x:1900,y:this.height2},{x:2000,y:this.height3}]; //{x:800,y:205},
	this.dogs=[];
	this.sprites=[]; //All sprites!
	
	//Sprite actions:
	this.CollisionAction={
	//Tietää, mitä törmäyksessä tehdään:
		Execute:function(sprite,context,time,fps){
			var collidingsprite;
			for(var n=0; n<game.sprites.length; ++n){
				collidingsprite=game.sprites[n];
				if(this.PossibleCollision(sprite,collidingsprite)==true){
					if(this.Collided(sprite,collidingsprite,context)==true){
						this.Collide(sprite,collidingsprite);
					}
				}
			}
		},
	
		PossibleCollision:function(sprite,colliding){
			//Kummankin pitää olla näkyvillä ja ei saa olla sama:
			if(sprite!=colliding && sprite.visible && colliding.visible){
				//Kummassakaan ei saa olla törmäys käynnissä:
				if(!sprite.collided && !colliding.collided){
					//Tarkistuksen tehostamiseksi käydään läpi vain objektit pelaajan kohdalla:
					var colliding_loc=colliding.x-colliding.offset
					if(colliding_loc<sprite.x+sprite.width && colliding_loc>sprite.x-sprite.width){
						return true;
					}
				}
			}
		},
		
		Collided:function(sprite,colliding,context){
			//Määritellään boundingboksin rajat(boski pienennetty 5pikseliä reunoista):
			//Tässä pelissä vain player törmää, joten arvot sieltä:
			var left_edge=sprite.x+5,
			right_edge=sprite.x+sprite.width-5,
			top_edge=sprite.y+5,
			bottom_edge=sprite.y+sprite.height-5,
			midX=left_edge+sprite.width/2,
			midY=top_edge+sprite.heigth/2;
			return this.PlayerCollided(left_edge,top_edge,right_edge,bottom_edge,midX,midY,colliding,context);
		},
		
		PlayerCollided:function(left_edge,top_edge,right_edge,bottom_edge,midX,midY,colliding,context){
			//Tarkistetaan collision boksi contextinavulla:
			context.beginPath();
			context.rect((colliding.x-colliding.offset),colliding.y,colliding.width,colliding.height);
			
			if(context.isPointInPath(left_edge,top_edge)==true || context.isPointInPath(right_edge,top_edge)==true){
				return true;
			}
			if(context.isPointInPath(midX,midY)==true){
				return true;
			}
			if(context.isPointInPath(left_edge,bottom_edge)==true || context.isPointInPath(right_edge,bottom_edge)==true){
				return true;
			}
			return false;
		},
		
		Collide:function(sprite,colliding){
			//piilotetaan vihollinen:
			//tehdaan pelaajalle vaadittava efekti:
			game.CollideEffect(sprite,colliding);
		}
	},
	//Create player Sprite:
	this.playerspriter=new SpriteFromSheet(this.spritesheet,this.playercells),
	//Create Sprites:
	this.player=new Sprite("player",this.playerspriter,[this.CollisionAction]);
	this.sprites.push(this.player),
	
	//Dummy ei animoi, palauttaa vain falseksi:
	this.CollisionAnimator=new SpriteAnimator(this.playercells,this.collision_duration,
	//This happens after collision animation:
		function(sprite,animator){
			sprite.collided=false;
			sprite.visible=true;
			this.current_track=1;
			sprite.mode.cell_index=0;
		}
	);
}

Game.prototype={ //prototype tarkoittaa js:ssä periytymistä, lol
//CALCULATIONS AND INITIALIZING:
	Run:function(){
		this.background_speed=this.scroll_speed;
		requestNextAnimationFrame(game.CalculateAnimation);
	},
	
	Initialize:function(){
		this.GenerateSprites();
		this.SetOffSets();
		this.background.src = "static/img/background_level_one_dark_red.png";
		this.spritesheet.src = "static/img/spritesheet.png";
		//kun tausta on ladattu niin peli voi alkaa:
		this.background.onload=function(e){
		game.Run();
		}
	},

	GenerateSprites:function(){
		this.CreateDogs();
		this.PositionSprites(this.dogs,this.dogdata);
	},
	
	PositionSprites:function(sprites,spritedata){
		var sprite;
		for(var n=0;n<sprites.length;++n){
			sprite=sprites[n];
			sprite.x=spritedata[n].x;
			sprite.y=spritedata[n].y;
		}
	},
	
	CreateDogs:function(){
		var doggy;
		var dogspriter=new SpriteFromSheet(this.spritesheet,this.dogcells);
		for(var n=0;n<this.dogdata.length;++n){
			doggy=new Sprite("dog",dogspriter);
			doggy.collided=false;
			doggy.width=50;
			doggy.height=50;
			doggy.x=0;
			doggy.y=0;
			this.dogs.push(doggy);
			this.sprites.push(doggy);
		}
	},
	
	
	CalculateY:function(tracknumber) {
		var height;
		if(tracknumber==1){
			height=this.height1;
		}
		else if(tracknumber==2){
			height=this.height2; 
		}
		else if(tracknumber==3){
			height=this.height3;
		}
		return height;
	},
	
	CalculateBackground:function(){
		//Calculate how much and what direction background moves:
		var sum=this.background_offset+this.background_speed/this.fps;
		
		if(sum>0 && sum<this.background.width){
			this.background_offset=sum;
		}
		else{
			this.background_offset=0;
		}
	},
	
	SetOffSets:function(){
		for(var n=1;n<this.sprites.length;++n){
			this.sprites[n].offset=0;
		}
	},
	
	CalculateSprites:function(){
		this.sprite_speed=this.background_speed*4.32;
		var sprite;
		
		for(var n=0;n<this.sprites.length;++n){
			sprite=this.sprites[n];
			if(sprite.type!="player"){
				if(sprite.collided==false){
					sprite.offset+=this.sprite_speed/this.fps;
				}
				else if(sprite.collided==true){
					sprite.offset-=this.sprite_speed/this.fps
				}
			}
		}
	},
	
	CalculateFPS:function(time) {
		
		if(this.prev_time==0){
			this.prev_time=time;
			return 60;
		}
		//millisekunteja:
		var fps=1000/(time-this.prev_time);
		this.prev_time=time;
		
		if((time-this.prev_update)>1000){
			this.prev_update=time;
		}
		
		return 60;
	},
	
	ResetGame:function(){
		//Reset variables:
		game.breath=40.0;
		game.prev_time=0;
		game.prev_update=0;
		game.completion=0.0;
		game.partial_completion=0;
		game.sprites=[];
		game.dogs=[];
		game.playerspriter=new SpriteFromSheet(game.spritesheet,game.playercells);
		game.player=new Sprite("player",game.playerspriter,[game.CollisionAction]);
		game.sprites.push(game.player);
		game.GenerateSprites();
		game.SetOffSets();
	},
	
	CalculateAnimation:function(time){
		if(game.paused==true){
			setTimeout(function(){requestNextAnimationFrame(game.CalculateAnimation);},game.pausetimer);
		}
		
		else{
			if(game.breath<=0){
				game.lost=!game.lost;
				game.DrawMessage("You are out of breath! You lost!, PRESS P TO RESTART!",50,200,"rgb(250,0,0)");
				game.ResetGame();
				game.TogglePause();
				setTimeout(function(){requestNextAnimationFrame(game.CalculateAnimation);},game.pausetimer);
				return;
			}
			if(game.completion>=100.0){
				game.won=!game.won;
				game.DrawMessage("You outran your chasers! You win!, PRESS P TO RESTART!",50,200,"rgb(250,0,0)");
				game.ResetGame();
				game.TogglePause();
				setTimeout(function(){requestNextAnimationFrame(game.CalculateAnimation);},game.pausetimer);
				return;
				
			}
			game.fps = game.CalculateFPS(time);
			game.Draw(time);
			requestNextAnimationFrame(game.CalculateAnimation);
		}
	},
	
	TogglePause:function(){
		var time_now=+new Date();
		this.paused=!this.paused; //clever way to toggle false->true, true->false
		if(this.paused==true){
			this.pause_start=time_now;
		}
		else{
			this.prev_time+=(time_now-this.pause_start);
		}
	},
	
	UpdateSprites:function(time){
		//Suorittaa collision checkin ja muut mahdolliset käyttäytymiset.
		var sprite;
		for(var n=0;n<this.sprites.length;++n){
			sprite=this.sprites[n];
			if(sprite.visible==true && this.SpriteOnView(sprite)){
				sprite.Update(this.context,time,this.fps);
			}
		}	
	},
	
	SpriteOnView:function(sprite){
		if(sprite==this.player){
			return true;
		}
		//Sprite on näyttöalueella:
		if((sprite.x+sprite.width)>sprite.offset && sprite.x<sprite.offset+this.canvas.width){
			return true;
		}
		
		
		if(sprite.x-sprite.offset<0){
			//Jos näytön ulkopuolella takarajasta se voidaan sijoittaa uudelleen jonnekin:
			this.RePosition(sprite);
		}
		
		
		return false;
		
	},
	
	RePosition:function(sprite){
		sprite.offset=0;
	},
	
	CalculatePlayer:function(){
		//Calculate track, level of breath and acceleration of player(Sprite):
		this.player.y=this.CalculateY(this.current_track);
		
		this.player.x=this.player.x+this.player_acc;
		if(this.player.x<50){
			this.player.x=50
		}
		if(this.player.x>700){
			this.player.x=700
		}
		
		if(this.current_track==1 && this.breath>=0){
			this.breath-=0.5;
		}
		else if(this.current_track==2 && this.breath<100){
			this.breath+=0.1;	
		}
		else if(this.current_track==3 && this.breath<100){
			this.breath+=0.5;
		}
		
		if(this.player_acc<0.0 && this.left_up==true){
			this.player_acc+=1.0;
		}
		if(this.player_acc>0.0 && this.right_up==true){
			this.player_acc-=1.0;
		}
	},
	
	RemoveSprite:function(sprite){
		//Nyt toimii vasta koirilla:
		var index1=this.sprites.indexOf(sprite);
		var index2=this.dogs.indexOf(sprite);
		this.sprites.splice(index1,1);
		this.dogs.splice(index2,1);	
	},
	
	RemoveEnemiesFrom:function(x,y){
		var x=x-this.canvas.getBoundingClientRect().left;
		var y=y-this.canvas.getBoundingClientRect().top;
		var sprite,sprite_x;
		if(this.dogs.length!=0){
				for(var n=0;n<this.dogs.length;++n){
					sprite=this.dogs[n];
					sprite_x=sprite.x-sprite.offset
					//koordinaattien täytyy olla sinnetänne oikein:
					if(y>=sprite.y-40 && y<=sprite.y+40){
						if(x>=sprite_x-50 && x<=sprite_x+50){
							this.RemoveSprite(sprite);
						}
					}	
				}	
		}
	},
	
//DRAWING:
	Draw:function(time){
		//Calculations:
		this.CalculatePlayer();
		this.CalculateBackground();
		this.CalculateSprites();
		
		//Primitive objects:
		this.DrawBackground();
		this.DrawBreathBar();
		this.DrawCompletionBar();
		
		//Sprites:
		this.UpdateSprites(time);
		this.DrawSprites();
	},
	
	DrawBackground:function(){
		this.context.save();
		this.context.globalAlpha=1.0;
		//Tausta piirretään 2 kertaa yhdellä ajalla, jotta scrollaus jatkuva:
		this.context.translate(-this.background_offset,0);
		this.context.drawImage(this.background,0,0,this.background.width,this.background.height);
		this.context.drawImage(this.background,this.background.width,0,this.background.width+1,this.background.height);
		this.context.restore();
	},
	
	DrawBreathBar:function(){
	this.context.save();
	this.context.strokeStyle=this.colorstyle;
	this.context.fillStyle=this.breath_bar_color;
	this.context.strokeRect(10, 10, this.breath, 15);
	this.context.fillRect(10, 10, this.breath, 15);
	this.context.restore();
	},
	
	DrawCompletionBar:function(){
	//Calculate Completion:
	this.partial_completion+=1;
	if(this.partial_completion==100){
		this.completion+=1;
		this.partial_completion=0;
	}
	this.context.save();
	this.context.strokeStyle=this.colorstyle;
	this.context.fillStyle=this.completion_bar_color;
	this.context.strokeRect(10, 30, this.completion, 10);
	this.context.fillRect(10, 30, this.completion, 10);
	this.context.restore();
	},
	
	DrawMessage:function(msg,x,y,color){
		//Draws Message on screen
		this.context.fillStyle=color;
  		this.context.font="bold 24px Arial";
  		this.context.fillText(msg, x, y);
	},
	
//SPRITES:
	CollideEffect:function(sprite,colliding,silent){
		sprite.collided=true;
		if(this.breath>=30){
			this.breath-=30;
		}
		else{
			this.breath=0;
		}
		colliding.collided=true;
		//true=sprite tulee takaisin:
		
		this.CollisionAnimator.Start(sprite,true);
		//Vihollinen palaa taaksepäin vain jonkin aikaa:
		setTimeout(function(){colliding.collided=false},2000);
	},
	
	DrawSprites:function(){
		var sprite;
		for(var n=0;n<this.sprites.length;++n){
			sprite=this.sprites[n];
			if(sprite.visible==true && this.SpriteOnView(sprite)==true){
				this.context.translate(-sprite.offset,0);
				sprite.Draw(this.context);
				this.context.translate(sprite.offset,0);
			}
		}
	},
}

//EVENT HANDLING:

window.onmousedown=function(e){
	//Tähän tulee vihollisten poisto
	var mousebuttoncode=e.which;
	//Left mouse:
	if(mousebuttoncode==1){
		//Remove enemies from mouselocation...
		var x=e.clientX;
		var y=e.clientY;
		game.RemoveEnemiesFrom(x,y);
	}
}


window.onkeyup=function(e){
	//checks if key that was pressed down is up again.
	var keycode=e.keyCode;
	if(keycode==39 && game.paused==false){
		game.right_up=true;
	}
	if(keycode==37 && game.paused==false){
		game.left_up=true;
	}
		
}

window.onkeydown=function(e){
	var keycode=e.keyCode;
	//pause with p;
	if(keycode==80){
		if(game.lost==false && game.won==false){
			game.DrawMessage("PAUSED, PRESS P TO CONTINUE!",100,100,"rgb(250,0,0)");
		}
		else{
			if(game.lost==true){
				game.lost=false;
			}
			if(game.won==true){
				game.won==false;
			}
		}
		//invert value:
		this.keypaused=!this.keypaused;
		game.TogglePause();
	}
	//up arrow jumps:
	if(keycode==38 && game.paused==false){
		e.preventDefault();
		if(game.current_track!=3){
			game.current_track++;
		}
	}
	//down arrow drops:
	if(keycode==40 && game.paused==false){
		e.preventDefault();
		if(game.current_track!=1){
			game.current_track--;
		}
	}
	//Right arrow advances right:
	if(keycode==39 && game.paused==false && game.player.x<800.0){
		game.player_acc=5.0;
		game.right_up=false;
	}
	//Left arrow advances left:
	if(keycode==37 && game.paused==false && game.player.x>50.0){
		game.player_acc=-5.0;
		game.left_up=false;
	}
}

//WINDOW FOCUS HANDLING:
window.onblur=function(){
	game.window_active=false;
	if(game.paused==false){
		game.DrawMessage("LOST FOCUS, CLICK HERE TO CONTINUE!",100,100,"rgb(250,0,0)");
		this.keypaused=false;
		game.TogglePause();
	}
}

window.onfocus=function(){
	game.window_active=true;
	if(this.keypaused==false){
		game.TogglePause();
	}
}

//START THE GAME:
var game=new Game();
game.Initialize();