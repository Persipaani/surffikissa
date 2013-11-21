<!DOCTYPE html>
<html>

	<head>
	   <title>Run Kitten Run!</title>
   </head>
   
   <body>

      <div id="wrapper">
      
      	<div id="msg">
        </div>

         <div id="header">
         	<div id="breath_bar"></div>
            <div id="score_counter">0</div>
            <div id="fps_counter"></div>
            <div id="LOWDEBUG">none</div>
            <div id="DEBUG">000</div>
         </div>

         <div id="game-area">
            <canvas id="game-canvas" width='800' height='400'>
               Your browser does not support HTML5 Canvas.
            </canvas>
         </div>
      </div>
      
      <script src="static/js/sprites.js"></script>
      <script src="static/js/game.js"></script>
      <script src="static/js/requestNextAnimationFrame.js"></script>
  </body>
</html>