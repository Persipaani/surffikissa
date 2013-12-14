//Game-object:
var Game=function(){
	//elements:
	this.canvas = document.getElementById("game-canvas"),
	this.context = this.canvas.getContext("2d"),
	this.msg = document.getElementById("msg"),

	//Game Area:
	this.X_LIMIT=750,
	this.Y_LIMIT=360,
	
	//**************** Edit these to change difficulty of game etc *******************
	this.START_LOC_X=10,
	this.START_LOC_Y=150,
	this.BACKGROUND_DEFAULT_SPEED=30,
	this.BACKGROUND_MAX_SPEED=50,
	this.BACKGROUND_MIN_SPEED=20,
	this.BACKGROUND_ACC=0.2, //how fast speed of background changes on different places of it
	this.JUMPTIME=1000; //ms
	this.COLLISION_DURATION=2000; //ms
	this.CHANGE=3.0, //Speed of the player movement
	this.MOVEMENT_DEACC=0.1*this.CHANGE; //How fast player movement stops (lower value is slower)
	this.JUMP_DEACC=0.01*this.CHANGE; //How fast movement slows during jump
	this.STARTING_BREATH=30.0 //Starting breath amount
	this.MAXSPRITESPAWN = 2000, //How far rocks can spawn at max, will decrease when difficulty rises
    this.BACKGROUNDSPEEDINCREASE = 5, //How fast background speed will increase with difficulty
    this.TIMEFORDIFFICULTYINCREASE = 3000, //in ms
    this.MAXROCKS = 80, //How many rocksprites at max difficulty
    this.MAXSHARKS = 10,
    this.MAXBOATS = 5,
    this.MAXFISHS = 1,
    this.COLLISIONBOXDECREASE=0, //How much sprite collision area will be decreased (increased value makes bb smaller)
	//**************** Edit these to change difficulty of game etc *******************
	
	this.animation_fps=5
    this.background_speed = 30,
	this.sprite_speed = this.background_speed * 2.32, //4.32 originaali
	this.player_acc = 0.0,
	this.player_vert_acc = 0.0,

    //offsets:
	this.background_offset = 0,

    //timing:
    this.scoretimer = 0,
    this.difficultytimer = 0,
	this.jumpstart=0;	//Jumping started at this time
    this.prev_time = 0,	//for FPS
	this.prev_update = 0, //for FPS
	this.fps = 60,
	this.paused = false,
	this.pause_start = 0, //Time when game was paused
	this.pausetimer = 200, //How often game checks if it's unpaused
	this.window_active = true,

    //items:
	this.background = new Image(),
	this.spritesheet = new Image(),

    //other:
	this.player_jumping = false,
	this.player_up = false,
	this.player_down = false,
	this.player_colliding = false,
	this.right_up = true, //for keys
	this.left_up = true,	//for keys
	this.up_up = true,	//for keys
	this.down_up = true,	//for keys
	this.breath = this.STARTING_BREATH,
	this.breath_bar_color = "rgb(0,25,200)",
	this.keypaused = false, //tells if game was paused by pressing.
	this.lost = false,
	this.won = false,
	this.onmenu = true,
	this.score = 0,
    this.lvl = 0,
    this.previous_y = 55,
    this.previous_x = 0,
    this.spacebar_down = false, //ettei voi hyppiä spacebar pohjassa
    this.game_over_screen = false;
    this.high_score = 0;
    
	
	//sound
	this.soundCheckbox = document.getElementById('sound-checkbox');
	
	this.musicCheckbox = document.getElementById('music-checkbox');
	this.soundOn = this.soundCheckbox.checked;
	this.musicOn = this.musicCheckbox.checked;
	this.sounds = [];
	this.playing_sounds = [];
	this.soundtrack          = document.getElementById('soundtrack');
	this.jump_sound		= document.getElementById('jump');
	this.collision_sound	= document.getElementById('collision');
	this.game_over_sound = document.getElementById('sound_game_over');
	this.cat_sound = document.getElementById('cat');
	this.sounds.push(this.jump_sound);
	this.sounds.push(this.collision_sound);
	this.sounds.push(this.game_over_sound);
	this.sounds.push(this.cat_sound);
	////console.log(this.collision_sound);
	
	//Sprite locations:
	
	//Celleissä x ja y meinaa koordinaatteja sheetissä (vasempaan yläkulmaan):
	// HUOM!!! CELLEJÄ TULEE AINA OLLA YHTÄ MONTA JOKAISELLE ACTIONILLE, MUUTEN KUSEE!
	this.playercells_right=[{x:0,y:5,width:50,height:45},{x:50,y:5,width:45,height:43},{x:100,y:5,width:48,height:43}],
	this.playercells_still=[{x:0,y:83,width:50,height:35},{x:54,y:83,width:45,height:35},{x:107,y:83,width:48,height:35}],
	this.playercells_jumping=[{x:0,y:120,width:45,height:45},{x:57,y:120,width:45,height:45},{x:109,y:120,width:45,height:45}],
	this.playercells_colliding=[{x:6,y:168,width:45,height:35},{x:62,y:168,width:45,height:35},{x:168,y:120,width:45,height:35}],
	this.playercells_died=[{x:150,y:5,width:50,height:45},{x:200,y:5,width:45,height:43},{x:257,y:5,width:48,height:43}],
	this.rockcells=[{x:5,y:50,width:35,height:25},{x:53,y:50,width:35,height:25},{x:101,y:50,width:35,height:25},];
	this.sharkcells = [{x:5, y: 200, width: 100, height:100},{x:5+100, y: 200, width: 100, height:100},{x:5+200, y: 200, width: 100, height:100},
						{x:5+300, y: 200, width: 100, height:100} ];
	this.boatcells = [{x:0, y: 407, width: 111, height:83},
	                  {x:111, y: 407, width: 111, height:83},
	                  {x:2*111, y: 407, width: 111, height:83},
	                  {x:3*111, y: 407, width: 111, height:83} ];
	this.fishcells = [{x:0, y: 509, width: 44, height:20},
	                  {x:44, y: 509, width: 44, height:20},
	                  {x:2*44, y: 509, width: 44, height:20},
	                  {x:3*44, y: 509, width: 44, height:20} ];
	// alas == right
	
	this.playercells_down = [{x:0, y:305,width:50,height:45},
	                         {x:56, y:305,width:50,height:45},
								{x:2*56, y:305,width:50,height:45}
								];
	this.playercells_up = [{x:0, y:359,width:50,height:45},
	                         {x:56, y:359,width:50,height:45},
								{x:112, y:359,width:50,height:45}
								];
	//Tämä on sijaintidataa pelikentällä:
	this.rockdata=[{x:1200,y:55},{x:1300,y:155},{x:1500,y:200},{x:1700,y:255},
	{x:1750,y:400},{x:1200,y:200},{x:1900,y:300},{x:2000,y:320}];
	
	this.sharkdata = [{x:1300,y:250},{x:1500,y:300}];
	this.boatdata = [{x:500,y:300}];
	this.fishdata = [{x:1000,y:500}];
	
	this.rocks=[];
	this.sharks=[];
	this.boats=[];
	this.fishs=[]; //good english 
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
						////console.log("collidingsprite: ", collidingsprite.type);
						
						
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
		    var left_edge = sprite.x + game.COLLISIONBOXDECREASE;
		    right_edge = sprite.x + sprite.width - game.COLLISIONBOXDECREASE;
		    top_edge = sprite.y + game.COLLISIONBOXDECREASE;
		    bottom_edge = sprite.y + sprite.height - game.COLLISIONBOXDECREASE;
		    midX = left_edge + sprite.width / 2;
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
			if (!game.lost){
				game.CollideEffect(sprite,colliding);
				
				
			}
			
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
	this.SharkAction={
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
	this.BoatAction={
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
		this.FishAction={
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
	
	// shark
	this.sharkspriter = new SpriteFromSheet(this.spritesheet, this.sharkcells);
	// boat
	this.boatspriter = new SpriteFromSheet(this.spritesheet, this.boatcells);
	// fish
	this.fishspriter = new SpriteFromSheet(this.spritesheet, this.fishcells);
	//Create rockspriter:
	this.rockspriter=new SpriteFromSheet(this.spritesheet,this.rockcells);
	//Create player Sprite:
	this.playerspriter=new SpriteFromSheet(this.spritesheet,this.playercells_right),
	//Create Sprites:
	this.player=new Sprite("player",this.playerspriter,[this.CollisionAction,this.MoveAction]);
	this.player.x=this.START_LOC_X;
	this.player.y=this.START_LOC_Y;
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
			////console.log(this.soundtrack.paused);
		}
	},
	
	Initialize:function(){
	
		this.GenerateSprites();
		this.SetOffSets();
		this.background.src = "static/img/start_background.png";
		this.spritesheet.src = "static/img/spritesheet1.png";
		//kun tausta on ladattu niin peli voi alkaa:
		this.background.onload=function(e){
		game.Run();
		}
	},
	
	GenerateSprites:function(){
		this.CreateRocks();
		this.CreateSharks();
		this.CreateBoats();
		this.CreateFishs();
		var sprites = [];
		sprites.push(this.rocks);
		sprites.push(this.sharks);
		sprites.push(this.boats);
		sprites.push(this.fishs);
		var spritedata = [];
		spritedata.push(this.rockdata);
		spritedata.push(this.sharkdata);
		spritedata.push(this.boatdata);
		spritedata.push(this.fishdata);
		this.PositionSprites(sprites,spritedata);
	},
	
	PositionSprites:function(sprites,spritedata){
		var sprite;
		for(var n=0;n<sprites.length;++n){
			sprite=sprites[n];
			sprite.x=spritedata[n].x;
			sprite.y=spritedata[n].y;
		}
	},
	
	CreateSharks:function(){
		var shark;
		for (var n=0; n<=this.sharkdata.length;++n){
			shark=new Sprite("shark",this.sharkspriter,[this.SharkAction]);
			shark.collided=false;
			shark.width=100;
			shark.height=100;
			shark.x=0;
			shark.y=0;
			shark.animation_fps=this.animation_fps;
			this.sharks.push(shark);
			this.sprites.splice(this.sprites.length-1,0,shark);
		}
		
	},
	CreateBoats:function(){
		var boat;
		for (var n=0; n<=this.boatdata.length;++n){
			boat=new Sprite("boat",this.boatspriter,[this.BoatAction]);
			boat.collided=false;
			boat.width=105;
			boat.height=55;
			boat.x=0;
			boat.y=0;
			boat.animation_fps=this.animation_fps;
			this.boats.push(boat);
			this.sprites.splice(this.sprites.length-1,0,boat);
		}
		
	},
	CreateFishs:function(){
		var fish;
		for (var n=0; n<=this.fishdata.length;++n){
			fish=new Sprite("fish",this.fishspriter,[this.FishAction]);
			fish.collided=false;
			fish.width=44;
			fish.height=20;
			fish.x=0;
			fish.y=0;
			fish.animation_fps=this.animation_fps;
			this.fishs.push(fish);
			this.sprites.splice(this.sprites.length-1,0,fish);
		}
		
	},
	
	CreateRocks:function(){
		var rock;
		//var rockspriter=new SpriteFromSheet(this.spritesheet,this.rockcells);
		for(var n=0;n<this.rockdata.length;++n){
			rock=new Sprite("rock",this.rockspriter,[this.SplashAction]);
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
	
	CreateOneRock:function(){
		//Creates a new rock sprite in random location outside game area:
		rock=new Sprite("rock",this.rockspriter,[this.SplashAction]);
		rock.collided=false;
		rock.width=35;
		rock.height=25;
		rock.x=Math.floor((Math.random()*2000)+this.X_LIMIT+50);
		rock.y=Math.floor((Math.random()*(this.Y_LIMIT-55))+55);
		rock.animation_fps=this.animation_fps;
		this.rocks.push(rock);
		this.sprites.splice(0,0,rock);
	},


	CreateOneShark: function () {
	    //Creates a new shark sprite in random location outside game area:
	    shark = new Sprite("shark", this.sharkspriter, [this.SharkAction]);
	    shark.collided = false;
	    shark.width = 100;
	    shark.height = 100;
	    shark.x = Math.floor((Math.random() * this.MAXSPRITESPAWN) + this.X_LIMIT + 50);;
	    shark.y = Math.floor((Math.random() * (this.Y_LIMIT - 55)) + 55);;
	    shark.animation_fps = this.animation_fps;
	    this.sharks.push(shark);
	    this.sprites.splice(this.sprites.length-1, 0, shark);
	},
	CreateOneBoat: function () {
	    //Creates a new boat sprite in random location outside game area:
	    boat = new Sprite("boat", this.boatspriter, [this.BoatAction]);
	    boat.collided = false;
	    boat.width = 105;
	    boat.height = 55;
	    boat.x = Math.floor((Math.random() * this.MAXSPRITESPAWN) + this.X_LIMIT + 50);;
	    boat.y = Math.floor((Math.random() * (this.Y_LIMIT - 55)) + 55);;
	    boat.animation_fps = this.animation_fps;
	    this.boats.push(boat);
	    this.sprites.splice(this.sprites.length-1, 0, boat);
	},
	CreateOneFish: function () {
	    //Creates a new fish sprite in random location outside game area:
	    fish = new Sprite("fish", this.fishspriter, [this.FishAction]);
	    fish.collided = false;
	    fish.width = 44;
	    fish.height = 20;
	    fish.x = Math.floor((Math.random() * this.MAXSPRITESPAWN) + this.X_LIMIT + 50);;
	    fish.y = Math.floor((Math.random() * (this.Y_LIMIT - 55)) + 55);;
	    fish.animation_fps = this.animation_fps;
	    this.fishs.push(fish);
	    this.sprites.splice(this.sprites.length-1, 0, fish);
	},
	
	CalculateBackground:function(){
		if(this.breath>=0 && this.lost == false){
			//Calculate how much and what direction background moves:
			
			//if player is in the middle try to reset to default speed:
			if(this.player.x<=500 && this.player.x>=200){
				if(this.background_speed>this.BACKGROUND_DEFAULT_SPEED){
					this.background_speed-=this.BACKGROUND_ACC;	
				}
				if(this.background_speed<this.BACKGROUND_DEFAULT_SPEED){
					this.background_speed+=this.BACKGROUND_ACC;	
				}
			}
			
			//if player is on the lead the background tries to catch up until it reaches max
			if(this.player.x>500 && this.background_speed<this.BACKGROUND_MAX_SPEED){
				this.background_speed+=this.BACKGROUND_ACC;
			}
			
			//if player is behind background slows down until it moves as little as possible
			if(this.player.x<200 && this.background_speed>this.BACKGROUND_MIN_SPEED){
				this.background_speed-=this.BACKGROUND_ACC;
			}
			
			//Finally let's update the speed of sprites to match background:
			this.sprite_speed=this.background_speed*2.32
			
			//DEBUG.innerHTML="back_speed:"+this.background_speed + "sprites" + this.sprites.length + "lvl:" + this.lvl + "points: " + this.score;
			var sum=this.background_offset+this.background_speed/this.fps;
			
			if(sum>0 && sum<this.background.width){
				this.background_offset=sum;
			}
			else{
				this.background_offset=0;
			}
			
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
			    sprite.offset+=this.sprite_speed/this.fps;
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
		//console.log("reset");
	    //**************** Edit these to change difficulty of game etc *******************
	    this.BACKGROUND_DEFAULT_SPEED = 30;
	    this.BACKGROUND_MAX_SPEED = 50;
	    this.BACKGROUND_MIN_SPEED = 20;
	    this.STARTING_BREATH = 30.0 //Starting breath amount
	    this.MAXSPRITESPAWN = 2000, //How far rocks can spawn at max, will decrease when difficulty rises
        this.STARTING_BREATH = 30.0 //Starting breath amount
	    //**************** Edit these to change difficulty of game etc *******************

	    this.background_speed = 30,
        this.sprite_speed = this.background_speed * 2.32, //4.32 originaali
        this.player_acc = 0.0,
        this.player_vert_acc = 0.0,

	    //offsets:
        this.background_offset = 0,

	    //timing:
        this.scoretimer = 0,
        this.difficultytimer = 0,
        this.jumpstart = 0;	//Jumping started at this time
	    this.prev_time = 0,	//for FPS
        this.prev_update = 0, //for FPS
        this.fps = 60,
        this.window_active = true,

	    //other:
        this.player_jumping = false,
        this.player_up = false,
        this.player_down = false,
        this.player_colliding = false,
        this.right_up = true, //for keys
        this.left_up = true,	//for keys
        this.up_up = true,	//for keys
        this.down_up = true,	//for keys
        this.breath = this.STARTING_BREATH,
        this.breath_bar_color = "rgb(0,25,200)",
        this.lost = false,
        this.won = false,
        
        
        
        //this.score = 0,
        this.lvl = 0,
        this.previous_y = 55,
        this.previous_x = 0,
        this.spacebar_down = false, //ettei voi hyppiä spacebar pohjassa
        this.game_over_screen = false;
	    //console.log("high: ", game.high_score);
    	//console.log("score: ", game.score);
	    if (game.high_score>=game.score){
	    	//console.log("high: ", this.high_score);
	    	//console.log("score: ", game.score);
	    	game.high_score=game.score;
	    }else{
	    	game.high_score = game.high_score;
	    }
	    game.score = 0;
		//finally reset sprites:
		game.sprites=[];
		game.rocks=[];
		game.sharks = [];
		game.boats = [];
		game.fishs = [];
		game.playerspriter=new SpriteFromSheet(game.spritesheet,game.playercells_right);
		game.player=new Sprite("player",this.playerspriter,[this.CollisionAction,this.MoveAction]);
		game.player.y=game.START_LOC_Y;
		game.player.x=game.START_LOC_X;
		game.sprites.push(game.player);
		game.GenerateSprites();
		game.SetOffSets();
		
		//sounds
		game.game_over_sound.pause();
		////console.log("game_over_sound: ", game.game_over_sound.paused)
	},
	
	CalculateAnimation:function(time){
		if(game.paused==true && game.onmenu==false){
			setTimeout(function(){requestNextAnimationFrame(game.CalculateAnimation);},game.pausetimer);
		}
		else{
			//There are no winners here, only loosers...
			if(game.breath<1 && game.lost == false){
				//if (this.score > this.high_score) this.high_score = this.score;
				//console.log("high_Score loosing: ", game.high_score);
				var temp_high_score = game.high_score;
				game.game_over_screen = true;
				game.soundtrack.pause();
				setTimeout(function(){game.game_over_sound.currentTime = 0;game.game_over_sound.play();},1500);
				game.lost= true;
				game.background_speed = 0;
				setTimeout(function(){game.background_offset=0;game.background.src="static/img/end_background.png";}, 9000);
				//Nämä pitää timeouttaa hetken päähän, että background ehtii piirtyä kerran:
				setTimeout(function(){game.onmenu=true;},9010);
				
				setTimeout(function(){game.DrawMessage(game.score,70,240,"rgb(255,69,0)",40);},9020);
				
					
				setTimeout(function(){game.ResetGame();},9030);
				game.high_score = temp_high_score;
			}
			
			game.fps = game.CalculateFPS(time);
			game.Draw(time);
			if(game.onmenu==false){
				requestNextAnimationFrame(game.CalculateAnimation);
			}
			
			//This is here since main menu must be drawn once before pause:
			if(game.onmenu==true){
				this.soundtrack.pause();
				game.paused=true;
				game.keypaused=true;
				game.game_over_sound.pause();
				
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
			if (this.soundOn){
				for (var i = 0; i< this.sounds.length; ++i){
					////console.log(this.sounds[i]);
					if(!this.sounds[i].paused){
						////console.log(this.sounds[i])
						this.sounds[i].pause();
						this.playing_sounds.push(this.sounds[i]);
					}
				}
			}
		}
		else{
			this.prev_time+=(time_now-this.pause_start);
			if(this.musicOn){
				this.soundtrack.play();
			}
			if(this.soundOn){
				////console.log("ääniä on päällä: ", this.playing_sounds.length)
				for (var i = 0; i < this.playing_sounds.length;++i ){
					////console.log("ääni pääälle: ", this.playing_sounds[i]);
					this.playing_sounds[i].play();
					this.playing_sounds.splice(i,1);
				}
				if(this.game_over_sound.paused && this.lost){
					this.game_over_sound.play();
					this.soundtrack.pause();
				}
				
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
		//Random x so that it's initially outside of the screen:
	    sprite.x = Math.floor((Math.random() * this.MAXSPRITESPAWN) + this.X_LIMIT + 50);

	    if (this.previous_x < this.MAXSPRITESPAWN ) {
	        //lasketaan lisays (minimissään +this.X_LIMIT + 50, maksimissaan + 50 ja edellinen:
	        this.previous_x += Math.floor((Math.random() * 600) + this.X_LIMIT + 50);
	        sprite.x = this.previous_x;
	    }
	    else {
	        //palataan alkuun
	        sprite.x = Math.floor((Math.random() * 20) + this.X_LIMIT + 50);
	        this.previous_x = sprite.x;
	    }


	    if (this.previous_y < (this.Y_LIMIT - 55)) {
	        //lasketaan lisays (minimissään +10, maksimissaan + 55):
	        this.previous_y += Math.floor((Math.random() * 55) + 10);
	        sprite.y = this.previous_y;
	    }
	    else {
            //palataan alkuun
	        sprite.y = Math.floor((Math.random() * 20) + 55);
	        this.previous_y = sprite.y;
	    }

	    this.previous_y = sprite.y;
	    this.previous_x = sprite.x;

		//finally reset offset:
		sprite.offset=0;
	},
	
	CalculatePlayer:function(time){
		//Jumping starts:
		if(this.jumpstart==0 && game.player_jumping==true){
			this.player.y-=10;
			this.jumpstart=time;
			if (this.soundOn)
				this.jump_sound.currentTime = 0;
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
		}else if(game.player_down && game.player_colliding!=true){
			this.playerspriter.cells=this.playercells_down;
		}else if(game.player_up && game.player_colliding!=true){
			this.playerspriter.cells=this.playercells_up;
		}
		else if(game.player_colliding==true){
			this.playerspriter.cells=this.playercells_colliding;	
		}
		else if(game.lost && !game.player_colliding){
			this.playerspriter.cells=this.playercells_died;
		}
		else if(game.player_colliding!=true ){
			if(this.player_acc!=0.0 || this.player_vert_acc!=0.0){
				this.playerspriter.cells=this.playercells_right;
			}
			else{
				this.playerspriter.cells=this.playercells_still;
			}
		}
		
		if(this.player.x<10){
			this.player.x=10;
		}
		if(this.player.x>this.X_LIMIT){
			this.player.x=this.X_LIMIT;
		}
		
		if(this.player.y<55){
			this.player.y=55;
		}
		if(this.player.y>this.Y_LIMIT){
			this.player.y=this.Y_LIMIT;
		}
		

		//Henkeä tulee hitaasti lisää 40 asti
		else if(this.breath<40.0 && this.breath > 0){
			this.breath+=0.05;
		}
		if(this.breath>40.0){
			this.breath=40.0;
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
	
	CalculateDifficulty: function (time) {
		if(this.breath>=0 && this.lost == false){
			//Start:
		    if (this.difficultytimer==0){
		        this.difficultytimer = time;
		    }

		    else if (time - this.difficultytimer > this.TIMEFORDIFFICULTYINCREASE) {

		        if (this.sprites.length < this.MAXROCKS+1) {
		            this.CreateOneRock();
		        }

		        if (this.lvl % 5 == 0 && this.sharks.length < this.MAXSHARKS) {
		            this.CreateOneShark();
		        }
		        if (this.lvl % 8 == 0 && this.boats.length < this.MAXBOATS) {
		            this.CreateOneBoat();
		        }
		        if (this.lvl % 12 == 0 && this.fishs.length < this.MAXFISHS) {
		            this.CreateOneFish();
		        }

		        if(this.BACKGROUND_MAX_SPEED<100){
		            this.BACKGROUND_MAX_SPEED+=this.BACKGROUNDSPEEDINCREASE;
		        }
		        
		        if(this.BACKGROUND_MIN_SPEED<this.BACKGROUND_MAX_SPEED){
		            this.BACKGROUND_MIN_SPEED+=this.BACKGROUNDSPEEDINCREASE; 
		        }

		        if(this.BACKGROUND_DEFAULT_SPEED<this.BACKGROUND_MAX_SPEED){
		            this.BACKGROUND_DEFAULT_SPEED+=this.BACKGROUNDSPEEDINCREASE; 
		        }
		        if (this.MAXSPRITESPAWN > this.X_LIMIT + 200) {
		            this.MAXSPRITESPAWN -= 50;
		        }

		        this.lvl += 1;
	            this.difficultytimer = 0;
		    }
			
		}
	    

	},

	CalculateScore: function (time) {
		if (this.breath>0 && this.lost ==false){
			if (this.scoretimer == 0 || this.scoretimer==undefined) {
		        this.scoretimer = time;
		    }
	            //pisteet 1s välein
		    else if (time-this.scoretimer > 1000) {
		        this.score += Math.floor(this.background_speed + this.sprites.length + this.player.x);
		        this.scoretimer = 0;
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
			this.CalculateDifficulty(time);
			this.CalculateScore(time);
			
			//Primitive objects:
			this.DrawBackground();
			this.DrawBreathBar();
			this.DrawInfo();
			
			//Sprites:
			this.UpdateSprites(time);
			this.DrawSprites();
		}
		//Tausta piirretään aina
		else{
			this.DrawBackground();
		}
		
	},

	DrawInfo: function () {
	    this.DrawMessage("Breath: ", 10, 30, "rgb(255,69,0)", 24);
	    this.DrawMessage("Score: " + this.score + " | LVL: " + this.lvl, 10, 50, "rgb(255,69,0)", 24);
	    if(this.score>=this.high_score){
	    	this.high_score =this.score;
	    	//console.log("draw high:", this.high_score);
	    }
	    this.DrawMessage("HighScore: " + this.high_score , 500, 30, "rgb(0,0,153)", 24);

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
	this.context.strokeRect(100, 15, this.breath, 15);
	this.context.fillRect(100, 15, this.breath, 15);
	this.context.restore();
	},
	
	
	DrawMessage:function(msg,x,y,color,size){
		//Draws Message on screen
		this.context.fillStyle=color;
  		this.context.font="bold " + size + "px Arial";
  		this.context.fillText(msg, x, y);
	},
	
//SPRITES:
	CollideEffect:function(sprite,colliding,silent){
		sprite.collided=true;
		if(colliding.type =="fish"){
			this.breath =40;
			colliding.visible = false;
			this.cat_sound.currentTime = 0;
			this.cat_sound.play();
			////console.log("kala");
			colliding.collided=false;
			game.player_colliding=false;
			sprite.collided=false;
		}	
		else{
			////console.log("törmäys muuhun");
			if(this.breath>=30){
				this.breath-=30;
				
			}else{
				this.breath=0;
				
			}
			colliding.collided=true;
			game.player_colliding=true;
			if (game.soundOn)
				game.collision_sound.currentTime = 0;
				game.collision_sound.play();
			//Törmäyksen jälkeen:
			setTimeout(function(){
				colliding.collided=false;
				game.player_colliding=false;
				sprite.collided=false;
				sprite.visible=true;
				sprite.mode.cell_index=0;
				},game.COLLISION_DURATION);
		}
		
		
		
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

window.onkeyup=function(e){
	//checks if key that was pressed down is up again.
	var keycode=e.keyCode;
	if(keycode==37 && game.paused==false){
		game.left_up=true;
	}
	if(keycode==38 && game.paused==false){
		game.up_up=true;
		game.player_up = false;
	}
	if(keycode==39 && game.paused==false){
		game.right_up=true;
		
	}
	if(keycode==40 && game.paused==false){
		game.down_up=true;
		game.player_down = false;
	}
	if(keycode==32) game.spacebar_down = false;
}

window.onkeydown=function(e){
    var keycode = e.keyCode;
	//pause with p;
	if(keycode==80 && !game.game_over_screen){
		if(game.lost==false && game.won==false && game.onmenu==false){
			game.DrawMessage("PAUSED, PRESS P TO CONTINUE!",180,220,"rgb(250,0,0)",24);
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
	// ei voi liikkua törmäyksen aikana tai  kun on kuollut
	if (!game.player_colliding && game.breath > 0 && !game.lost){
		//Can't move during jump!
		//up arrow moves up:
	    if (keycode == 38 && game.paused == false && game.player.y > 55.0) {
	        e.preventDefault();
			if(game.player_jumping==false){
				game.player_vert_acc=-game.CHANGE;
			}
			game.up_up=false;
			game.player_up = true;
		}
		//down arrow moves down:
	    if (keycode == 40 && game.paused == false && game.player.y < game.Y_LIMIT) {
	        e.preventDefault();
			if(game.player_jumping==false){
				game.player_vert_acc=game.CHANGE;
			}
			game.down_up=false;
			game.player_down = true;
		}
		//Right arrow advances right:
		if(keycode==39 && game.paused==false && game.player.x<game.X_LIMIT){
			if(game.player_jumping==false){
				game.player_acc=game.CHANGE;
			}
			game.right_up=false;
		}
		//Left arrow advances left:
		if(keycode==37 && game.paused==false && game.player.x>10.0){
			if(game.player_jumping==false){
				game.player_acc=-game.CHANGE;
			}
			game.left_up=false;
		}
		if (keycode == 32 && game.player_jumping == false && game.player_colliding == false) {
		    e.preventDefault();
			if (!game.spacebar_down)
				game.player_jumping=true;
			game.spacebar_down = true;
		}
		
	}
	else if (keycode == 38 || keycode == 40 || keycode == 32) {
	    e.preventDefault();
	}
	
	}



//WINDOW FOCUS HANDLING:
window.onblur=function(){
	if(!game.game_over_screen){
		game.window_active=false;
		if(game.paused==false){
			game.DrawMessage("LOST FOCUS, CLICK HERE TO CONTINUE!",150,220,"rgb(250,0,0)",24);
			this.keypaused=false;
			game.TogglePause();
		}
	}
	
}

window.onfocus=function(){
	if(!game.game_over_screen){
		game.window_active=true;
		if(this.keypaused==false){
			game.TogglePause();
		}
	}
	
}




//START THE GAME:
var game=new Game();
game.Initialize();

