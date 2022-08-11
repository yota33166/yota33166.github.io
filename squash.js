var ballX = 600;
var ballY = 300;
var ballXp =  0;
var ballYp =  0;

var ball2X = 600;
var ball2Y = 200;
var ball2Xp =  0;
var ball2Yp =  0;

var ball3X = 600;
var ball3Y = 100;
var ball3Xp =  0;
var ball3Yp =  0;

var ball4X = 600;
var ball4Y = 100;
var ball4Xp =  0;
var ball4Yp =  0;

var barX = 600;
var barY = 700;
var score = 0;
var scene = 0;//場面管理の変数

//それぞれのボールが落ちたかどうか判定
var fallcheck1 = 0;
var fallcheck2 = 0;
var fallcheck3 = 0;
var fallcheck4 = 0;

//health が0になるとゲームオーバー
var health = 4;
function setup(){
    canvasSize(1200, 800);
    lineW(3);
    loadImg(0, "image/bg.png");
    loadImg(1, "image/heart.tr.png");
    loadSound(0, "sound/se.m4a");
}

function mainloop(){
    drawImg(0, 0, 0);
    if (health >= 1){
        drawImgS(1, 0, 0, 100, 100);
    }
    if (health >= 2){
        drawImgS(1, 100, 0, 100, 100);
    }
    if (health >=3){
        drawImgS(1, 200, 0, 100, 100);
    }
    if (health >= 4){
        drawImgS(1, 300, 0, 100, 100);
    }
    
    setAlp(70);
    fRect(250, 50, 700, 750, "black");
    setAlp(100);
    sRect(250, 50, 700, 760, "silver");
    fText("SCORE"+score, 600, 25, 36, "white");
    sRect(barX-50,barY-10,100,20,"violet");//バー
    sCir(ballX, ballY, 10, "lime"); //ボール
    

    //タイトル画面
    if(scene == 0){
        fText("Squash Game", 600, 200, 48, "cyan");
        fText("Click to start!", 600, 600, 36, "gold");
        if(tapC==1){
            ballX = 600;
            ballY = 300;
            ballXp = 12;
            ballYp = 8;
           
            //二つ目のボール
            ball2X = 600;
            ball2Y = 201;
            ball2Xp = 10;
            ball2Yp = 7;
            //三つめのボール
            ball3X = 300;
            ball3Y = 301;
            ball3Xp = 8;
            ball3Yp = 4;
            //4つめのボール
            ball4X = 400;
            ball4Y = 301;
            ball4Xp = 10;
            ball4Yp = 10;
            added = 0;
            score = 2000;
            scene = 1;
            //ボールが落ちたかどうか
            fallcheck1 = 0;
            fallcheck2 = 0;
            fallcheck3 = 0;
            fallcheck4 = 0;
            //体力
            health = 4;
        }
    }
    //プレイ中
    else if(scene == 1){
        ballX += ballXp;
        ballY += ballYp;
        if(ballX<=260 || ballX>=940) ballXp = -ballXp;
        if(ballY<=60) ballYp = -ballYp;

        if(ballY>790 && fallcheck1 == 0){ 
            health -= 1;
            fallcheck1 += 1;
        }
        barX = tapX;//tapXはマウスポインターの座標
        if(barX < 300) barX = 300;
        if(barX > 900) barX = 900;
        
        //ヒットチェック
        if(barX-65<ballX && ballX<barX+65 &&
           barY-32<ballY && ballY<barY+5){
         ballYp = -8-rnd(8);
         score += 100;
         playSE(0);
        }
        
        //ボール2追加
        if (score > 400){
            sCir(ball2X, ball2Y,10,"white");
            ball2X += ball2Xp;
            ball2Y += ball2Yp;
        }
            if(ball2X<=260 || ball2X>=940) ball2Xp = -ball2Xp;
            if(ball2Y<=60) ball2Yp = -ball2Yp;

            if(ball2Y>790 && fallcheck2 == 0){
                health -= 1;
                fallcheck2 += 1;
            }

            //ヒットチェック
            if(barX-65<ball2X && ball2X<barX+65 &&
            barY-32<ball2Y && ball2Y<barY+5){
            ball2Yp = -7-rnd(7);
            score += 100;
            playSE(0);
            
        }
        //ボール3追加
        if (score > 1400){
            sCir(ball3X, ball3Y,10,"yellow");
            ball3X += ball3Xp;
            ball3Y += ball3Yp;
            }
            if(ball3X<=260 || ball3X>=940) ball3Xp = -ball3Xp;
            if(ball3Y<=60) ball3Yp = -ball3Yp;
        
            if(ball3Y>790 && fallcheck3 == 0){
                health -= 1;
                fallcheck3 += 1;
            }
    
                //ヒットチェック
            if(barX-65<ball3X && ball3X<barX+65 &&
            barY-32<ball3Y && ball3Y<barY+5){
            ball3Yp = -4-rnd(25);
            ball3Xp = rnd(30);
            score += 100;
            playSE(0);                 
                }
               //ボール4追加
            if (score > 900){
            sCir(ball4X, ball4Y,10,"gray");
            ball4X += ball4Xp;
            ball4Y += ball4Yp;
                }
            if(ball4X<=260 || ball4X>=940) ball4Xp = -ball4Xp;
            if(ball4Y<=60) ball4Yp = -ball4Yp;
        
            if(ball4Y>790 && fallcheck4 == 0){
                health -= 1;
                fallcheck4 += 1;
            }
        
                //ヒットチェック
            if(barX-65<ball4X && ball4X<barX+65 &&
            barY-32<ball4Y && ball4Y<barY+5){
            ball4Yp = -10-rnd(10);
            score += 100;
            playSE(0);
            }
        if (health <= 0) scene = 2;
            
    }
    //ゲームオーバー
    else if(scene == 2){
        fText("GAME OVER", 600, 400, 36, "red");
        if(tapC == 1){
            scene = 0;
            tapC = 0;
        }
    }
}