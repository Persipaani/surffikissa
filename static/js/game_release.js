//Game-object:
var Game=function(){
	//elements:
	this.canvas = document.getElementById("game-canvas"),
	this.context = this.canvas.getContext("2d"),
	this.msg = document.getElementById("msg"),

	//Game Area:
	this.X_LIMIT=750,
	this.Y_LIMIT=350,
	
	this.animation_fps=5
	this.background_speed=30,
	this.BACKGROUND_DEFAULT_SPEED=30,
	this.BACKGROUND_MAX_SPEED=50,
	this.BACKGROUND_MIN_SPEED=20,
	this.sprite_speed=this.background_speed*2.32, //4.32 originaali
	this.player_acc=0.0,
	this.player_vert_acc=0.0,
	
	//offsets:
	this.background_offset=0,
	
	//timing:
	this.JUMPTIME=1000; //ms
	this.COLLISION_DURATION=2000; //ms
	this.jumpstart=0;	//Jumping started at this time
	this.prev_time=0,	//for FPS
	this.prev_update=0, //for FPS
	this.fps=60,
	this.paused=false,
	this.pause_start=0, //Time when game was paused
	this.pausetimer=200, //How often game checks if it's unpaused
	this.window_active=true,
	
	//items:
	this.background  = new Image(),
	this.spritesheet = new Image(),
	
	//other:
	this.CHANGE=2.0, //Speed of the player movement
	this.MOVEMENT_DEACC=0.1*this.CHANGE; //How fast player movement stops (lower value is slower)
	this.JUMP_DEACC=0.01*this.CHANGE; //How fast movement slows during jump
	this.player_jumping=false,
	this.player_colliding=false,
	this.right_up=true, //for keys
	this.left_up=true,	//for keys
	this.up_up=true,	//for keys
	this.down_up=true,	//for keys
	this.breath=40.0,
	this.completion=0.0,
	this.partial_completion=0,
	this.breath_bar_color="rgb(0,25,200)",
	this.completion_bar_color="rgb(200,25,0)",
	this.keypaused=false, //tells if game was paused by pressing.
	this.lost=false;
	this.won=false;
	this.onmenu=true;
	
	//sound
	this.soundCheckbox = document.getElementById('sound-checkbox');
	
	this.musicCheckbox = document.getElementById('music-checkbox');
	this.soundOn = this.soundCheckbox.checked;
	this.musicOn = this.musicCheckbox.checked;
	
	this.soundtrack          = document.getElementById('soundtrack');
	this.jump_sound		= document.getElementById('jump');
	this.collision_sound	= document.getElementById('collision');
	console.log(this.collision_sound);
	
	//Sprite locations:
	
	//Celleissä x ja y meinaa koordinaatteja sheetissä (vasempaan yläkulmaan):
	// HUOM!!! CELLEJÄ TULEE AINA OLLA YHTÄ MONTA JOKAISELLE ACTIONILLE, MUUTEN KUSEE!
	this.playercells_right=[{x:0,y:5,width:50,height:45},{x:50,y:5,width:45,height:43},{x:100,y:5,width:48,height:43}],
	this.playercells_still=[{x:0,y:83,width:50,height:35},{x:54,y:83,width:45,height:35},{x:107,y:83,width:48,height:35}],
	this.playercells_jumping=[{x:0,y:120,width:45,height:45},{x:57,y:120,width:45,height:45},{x:109,y:120,width:45,height:45}],
	this.playercells_colliding=[{x:6,y:168,width:45,height:35},{x:62,y:168,width:45,height:35},{x:168,y:120,width:45,height:35}],
	this.rockcells=[{x:5,y:50,width:35,height:25},{x:53,y:50,width:35,height:25},{x:101,y:50,width:35,height:25}],
	//Tämä on sijaintidataa pelikentällä:
	this.rockdata=[{x:1200,y:200},{x:1300,y:400},{x:1500,y:200},{x:1700,y:400},
	{x:1750,y:400},{x:1200,y:200},{x:1900,y:300},{x:2000,y:320}];
	
	this.rocks=[];
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
			if(sprite!=colliding && sprite.visible && colliding.visible && game.player_jumping==false){
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
			game.collision_sound.play();
		}
	},
	
	this.MoveAction={
		previous:0,
		Execute: function(sprite,context,time,fps){
			if(sprite.animation_fps==0){
				return;
			}
			if(this.previous==0){
				this.previous=time;
			}
			else if(time-this.previous>1000/sprite.animation_fps){
				sprite.mode.NextCell()
				this.previous=time;
			}
		}
	},
	
	this.SplashAction={
		previous:0,
		Execute: function(sprite,context,time,fps){
			if(sprite.animation_fps==0){
				return;
			}
			if(this.previous==0){
				this.previous=time;
			}
			else if(time-this.previous>1000/sprite.animation_fps){
				sprite.mode.NextCell()
				this.previous=time;
			}
		}
	},
	
	
	
	
	//Create player Sprite:
	this.playerspriter=new SpriteFromSheet(this.spritesheet,this.playercells_right),
	//Create Sprites:
	this.player=new Sprite("player",this.playerspriter,[this.CollisionAction,this.MoveAction]);
	this.sprites.push(this.player);
}

Game.prototype={ //prototype tarkoittaa js:ssä periytymistä, lol
//CALCULATIONS AND INITIALIZING:
	Run:function(){
		this.player.animation_fps=this.animation_fps;
		requestNextAnimationFrame(game.CalculateAnimation);
		//this.soundCheckbox.onchange();
		//this.musicCheckbox.onchange();
		if (this.musicOn) {
			this.soundtrack.play();
		}
	},
	
	Initialize:function(){
		this.GenerateSprites();
		this.SetOffSets();
		this.background.src = "static/img/start_background.png";
		this.spritesheet.src = "static/img/spritesheet.png";
		//kun tausta on ladattu niin peli voi alkaa:
		this.background.onload=function(e){
		game.Run();
		}
	},
	
	GenerateSprites:function(){
		this.CreateRocks();
		this.PositionSprites(this.rocks,this.rockdata);
	},
	
	PositionSprites:function(sprites,spritedata){
		var sprite;
		for(var n=0;n<sprites.length;++n){
			sprite=sprites[n];
			sprite.x=spritedata[n].x;
			sprite.y=spritedata[n].y;
		}
	},
	
	CreateRocks:function(){
		var rock;
		var rockspriter=new SpriteFromSheet(this.spritesheet,this.rockcells);
		for(var n=0;n<this.rockdata.length;++n){
			rock=new Sprite("rock",rockspriter,[this.SplashAction]);
			rock.collided=false;
			rock.width=35;
			rock.height=25;
			rock.x=0;
			rock.y=0;
			rock.animation_fps=this.animation_fps;
			this.rocks.push(rock);
			this.sprites.splice(0,0,rock);
		}
	},
	
	CalculateBackground:function(){
		//Calculate how much and what direction background moves:
		
		//if player is in the middle try to reset to default speed:
		if(this.player.x<=300 && this.player.x>=100){
			if(this.background_speed>this.BACKGROUND_DEFAULT_SPEED){
				this.background_speed-=1;	
			}
			if(this.background_speed<this.BACKGROUND_DEFAULT_SPEED){
				this.background_speed+=1;	
			}
		}
		
		//if player is on the lead the background tries to catch up until it reaches max
		if(this.player.x>300 && this.background_speed<this.BACKGROUND_MAX_SPEED){
			this.background_speed+=1;
		}
		
		DEBUG.innerHTML="back_speed:"+this.background_speed;
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
		game.rocks=[];
		game.playerspriter=new SpriteFromSheet(game.spritesheet,game.playercells_right);
		game.player=new Sprite("player",game.playerspriter,[game.CollisionAction, game.MoveAction]);
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
				game.background.src="static/img/end_background.png";
				//Nämä pitää timeouttaa hetken päähän, että background ehtii piirtyä kerran:
				setTimeout(function(){game.onmenu=true;},10);
				setTimeout(function(){game.DrawMessage("points here: ",50,200,"rgb(250,0,0)");},20);
				setTimeout(function(){game.ResetGame();},30);
			}
			/*
			if(game.completion>=100.0){
				game.won=!game.won;
				game.DrawMessage("You outran your chasers! You win!, PRESS P TO RESTART!",50,200,"rgb(250,0,0)");
				game.ResetGame();
				game.TogglePause();
				setTimeout(function(){requestNextAnimationFrame(game.CalculateAnimation);},game.pausetimer);
				return;
				
			}
			*/
			
			game.fps = game.CalculateFPS(time);
			game.Draw(time);
			requestNextAnimationFrame(game.CalculateAnimation);
			
			//This is here since main menu must be drawn once before pause:
			if(game.onmenu==true){
				this.soundtrack.pause();
				game.paused=true;
				game.keypaused=true;
			}
		}
	},
	
	TogglePause:function(){
		var time_now=+new Date();
		this.paused=!this.paused; //clever way to toggle false->true, true->false
		if(this.paused==true){
			this.pause_start=time_now;
			if (this.musicOn){
				this.soundtrack.pause();
			}
		}
		else{
			this.prev_time+=(time_now-this.pause_start);
			if(this.musicOn){
				this.soundtrack.play();
			}
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
	
	CalculatePlayer:function(time){
		//Jumping starts:
		if(this.jumpstart==0 && game.player_jumping==true){
			this.player.y-=10;
			this.jumpstart=time;
			this.jump_sound.play();
		}
		//Jumping on:
		else if(time-this.jumpstart<this.JUMPTIME && game.player_jumping==true){
				if(this.player_acc<0.0){
				this.player_acc+=this.JUMP_DEACC;
				}
				if(this.player_acc>0.0){
					this.player_acc-=this.JUMP_DEACC;
				}
				if(this.player_vert_acc<0.0){
					this.player_vert_acc+=this.JUMP_DEACC;
				}
				if(this.player_vert_acc>0.0){
					this.player_vert_acc-=this.JUMP_DEACC;
				}
		}
		//Jumping ends:
		else if(time-this.jumpstart>this.JUMPTIME && game.player_jumping==true){
			this.player.y+=10;
			game.player_jumping=false;
			this.jumpstart=0;
			//Restore movement before jump:
			if(this.left_up==false){
				this.player_acc=-this.CHANGE;
			}
			if(this.right_up==false){
				this.player_acc=this.CHANGE;
			}
			if(this.up_up==false){
				this.player_vert_acc=-this.CHANGE;
			}
			if(this.down_up==false){
				this.player_vert_acc=this.CHANGE;
			}
		}
		
		//Calculate track, level of breath and acceleration of player(Sprite):
		this.player.y=this.player.y+this.player_vert_acc;
		this.player.x=this.player.x+this.player_acc;
		
		//Animoidaan eri tavalla liikkeessä:
		
		if(game.player_jumping==true){
			this.playerspriter.cells=this.playercells_jumping;
		}
		else if(game.player_colliding==true){
			this.playerspriter.cells=this.playercells_colliding;	
		}
		else if(game.player_colliding!=true){
			if(this.player_acc!=0.0 || this.player_vert_acc!=0.0){
				this.playerspriter.cells=this.playercells_right;
			}
			else{
				this.playerspriter.cells=this.playercells_still;
			}
		}
		
		if(this.player.x<50){
			this.player.x=50;
		}
		if(this.player.x>this.X_LIMIT){
			this.player.x=this.X_LIMIT;
		}
		
		if(this.player.y<10){
			this.player.y=10;
		}
		if(this.player.y>this.Y_LIMIT){
			this.player.y=this.Y_LIMIT;
		}
		
		//Henkeä tulee hitaasti lisää 100 asti
		else if(this.breath<100.0){
			this.breath+=0.05;
		}
		if(this.breath>100.0){
			this.breath=100.0;
		}

		if(this.player_acc<0.0 && this.left_up==true){
			this.player_acc+=this.MOVEMENT_DEACC;
		}
		if(this.player_acc>0.0 && this.right_up==true){
			this.player_acc-=this.MOVEMENT_DEACC;
		}
		if(this.player_vert_acc<0.0 && this.up_up==true){
			this.player_vert_acc+=this.MOVEMENT_DEACC;
		}
		if(this.player_vert_acc>0.0 && this.down_up==true){
			this.player_vert_acc-=this.MOVEMENT_DEACC;
		}
		
		
		//Kiihtyvyys resetoidaan lähellä nollaa:
		if(this.right_up==true && this.player_acc>-0.2 && this.player_acc<0.2){
			this.player_acc=0.0;
		}
		if(this.left_up==true && this.player_acc>-0.2 && this.player_acc<0.2){
			this.player_acc=0.0;
		}
		if(this.up_up==true && this.player_vert_acc>-0.2 && this.player_vert_acc<0.2){
			this.player_vert_acc=0.0;
		}
		if(this.down_up==true && this.player_vert_acc>-0.2 && this.player_vert_acc<0.2){
			this.player_vert_acc=0.0;
		}
		
	},
	
	RemoveSprite:function(sprite){
		//Nyt toimii vasta koirilla:
		var index1=this.sprites.indexOf(sprite);
		var index2=this.rocks.indexOf(sprite);
		this.sprites.splice(index1,1);
		this.rocks.splice(index2,1);	
	},
	
	RemoveEnemiesFrom:function(x,y){
		var x=x-this.canvas.getBoundingClientRect().left;
		var y=y-this.canvas.getBoundingClientRect().top;
		var sprite,sprite_x;
		if(this.rocks.length!=0){
				for(var n=0;n<this.rocks.length;++n){
					sprite=this.rocks[n];
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
		//Jos peli ei ole alku- tai loppumenussa piirretään kaikki muu
		if(this.onmenu==false){
			//Calculations:
			this.CalculatePlayer(time);
			this.CalculateBackground();
			this.CalculateSprites();
			
			//Primitive objects:
			this.DrawBackground();
			this.DrawBreathBar();
			this.DrawCompletionBar();
			
			//Sprites:
			this.UpdateSprites(time);
			this.DrawSprites();
		}
		//Tausta piirretään aina
		else{
			this.DrawBackground();
		}
		
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
		game.player_colliding=true;
		
		//Törmäyksen jälkeen:
		setTimeout(function(){
			colliding.collided=false;
			game.player_colliding=false;
			sprite.collided=false;
			sprite.visible=true;
			sprite.mode.cell_index=0;
			},game.COLLISION_DURATION);
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
	if(keycode==37 && game.paused==false){
		game.left_up=true;
	}
	if(keycode==38 && game.paused==false){
		game.up_up=true;
	}
	if(keycode==39 && game.paused==false){
		game.right_up=true;
	}
	if(keycode==40 && game.paused==false){
		game.down_up=true;
	}
		
}

window.onkeydown=function(e){
	var keycode=e.keyCode;
	//pause with p;
	if(keycode==80){
		if(game.lost==false && game.won==false && game.onmenu==false){
			game.DrawMessage("PAUSED, PRESS P TO CONTINUE!",100,100,"rgb(250,0,0)");
		}
		else{
			game.onmenu=false;
			game.background.src="static/img/sea_background.png";
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
	//Can't move during jump!
		//up arrow moves up:
		if(keycode==38 && game.paused==false && game.player.y>10.0){
			e.preventDefault();
			if(game.player_jumping==false){
				game.player_vert_acc=-game.CHANGE;
			}
			game.up_up=false;
		}
		//down arrow moves down:
		if(keycode==40 && game.paused==false && game.player.y<400.0){
			e.preventDefault();
			if(game.player_jumping==false){
				game.player_vert_acc=game.CHANGE;
			}
			game.down_up=false;
		}
		//Right arrow advances right:
		if(keycode==39 && game.paused==false && game.player.x<800.0){
			if(game.player_jumping==false){
				game.player_acc=game.CHANGE;
			}
			game.right_up=false;
		}
		//Left arrow advances left:
		if(keycode==37 && game.paused==false && game.player.x>50.0){
			if(game.player_jumping==false){
				game.player_acc=-game.CHANGE;
			}
			game.left_up=false;
		}
		if(keycode==32 && game.player_jumping==false && game.player_colliding==false){
			game.player_jumping=true;
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

game.soundCheckbox.onchange = function (e) {
		console.log("nappi");
		game.soundOn = game.soundCheckbox.checked;
	};
	
	game.musicCheckbox.onchange = function (e) {
		game.musicOn = game.musicCheckbox.checked;
console.log("nappi");
	   if (snailBait.musicOn) {
		  game.soundtrack.play();
	   }
	   else {
		  game.soundtrack.pause();
	   }
	};