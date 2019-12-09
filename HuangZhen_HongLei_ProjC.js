// Vertex shader program----------------------------------
var VSHADER_SOURCE =

    'precision highp float;\n' +
    'precision highp int;\n' +
	
	
	'struct LampT {\n' + // Describes one point-like Phong light source
    '  vec3 pos;\n' + // (x,y,z,w); w==1.0 for local light at x,y,z position
    '  vec3 ambi;\n' + // Ia ==  ambient light source strength (r,g,b)
    '  vec3 diff;\n' + // Id ==  diffuse light source strength (r,g,b)
    '  vec3 spec;\n' + // Is == specular light source strength (r,g,b)
    '}; \n' +
    'struct MatlT {\n' + // Describes one Phong material by its reflectances:
    '  vec3 emit;\n' + // Ke: emissive -- surface 'glow' amount (r,g,b);
    '  vec3 ambi;\n' + // Ka: ambient reflectance (r,g,b)
    '  vec3 diff;\n' + // Kd: diffuse reflectance (r,g,b)
    '  vec3 spec;\n' + // Ks: specular reflectance (r,g,b)
    '  int shiny;\n' + // Kshiny: specular exponent (integer >= 1; typ. <200)
    '};\n' +
	
  'uniform mat4 u_modelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 normal; \n' +					// Why Vec3? its not a point, hence w==0
  'varying vec3 v_Kd;\n' +
  //'varying vec3 v_Ks;\n' +
  'varying vec3 v_Ke;\n' +
  'varying vec4 vertexPosition;\n' +
  'varying vec3 v_eyePosWorld;\n' +
  'uniform vec3 u_eyePosWorld; \n' +
  
  //WorldLight and HeadLight Source uniforms
  'uniform LampT u_worldLight;\n' + // Array of all light sources.
  'uniform LampT u_headLight;\n' + // Array of all light sources.
  

	
    //Material uniforms
  'uniform MatlT u_MatlSet;\n' + // Array of all materials.

	//Control uniforms
  'uniform int headlightOn;\n' +
  'uniform int worldlightOn;\n' +
  'uniform int lightMode;\n' +
  'uniform int shadeMode;\n' +
  //'varying vec2 vworldlightOn;\n' +

  ' void main() {\n' +
  'if(shadeMode == 1){\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
  '  normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
  '  vertexPosition = u_modelMatrix * a_Position;\n' +
  '  v_Kd = u_MatlSet.diff; \n' +
  '  v_eyePosWorld = u_eyePosWorld; \n' +
  '}\n' +
  
  'if(shadeMode == 2){\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
  '  normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
  '  vertexPosition = u_modelMatrix * a_Position;\n' +
  '  v_Kd = u_MatlSet.diff; \n' +
  '  v_eyePosWorld = u_eyePosWorld; \n' +
  
  
  '  vec3 v_Normal = normalize(normal);\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_worldLight.pos - vec3(vertexPosition));\n' +
  '  vec3 hLightDirection = normalize(u_headLight.pos - vec3(vertexPosition));\n' +
  '  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - vec3(vertexPosition)); \n' +
     // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, v_Normal), 0.0);\n' +
  '  float nDotHl = max(dot(hLightDirection, v_Normal),0.0);\n' +
  '  float nDotH = 0.0; \n' +
  '  float nDotH_2 = 0.0; \n' +
  
  
  '  if(lightMode == 1){\n' +
    //Blinn-Phong Lighting
    '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '  nDotH = max(dot(H, normal), 0.0); \n' +
    '  vec3 H_2 = normalize(hLightDirection + eyeDirection); \n' +
    '  nDotH_2 = max(dot(H_2, normal), 0.0); \n' + 
  '    }\n' +
  
  
  //Phong Lighting
  'if(lightMode == 2){\n' +	
  //worldLight
    '      vec3 L = normalize(lightDirection); \n' +
    '      vec3 C = dot(v_Normal, L)*v_Normal; \n' +
    '      vec3 R = C + C - L; \n' +
	'      nDotH = max(dot(eyeDirection, R), 0.0); \n' +
    //headLight	
	'      vec3 L_2 = normalize(hLightDirection); \n' +
    '      vec3 C_2 = dot(v_Normal, L_2)*v_Normal; \n' +
    '      vec3 R_2 = C_2 + C_2 - L_2; \n' +
	'      nDotH_2 = max(dot(eyeDirection, R_2), 0.0); \n' +
   '}\n' +  
   
   '  float e64 = pow(nDotH, float(u_MatlSet.shiny));\n' +
   '  float e64_2 = pow(nDotH_2, float(u_MatlSet.shiny));\n' +
    '  vec3 emissive = 	u_MatlSet.emit;\n' +
    '  vec3 ambient = u_worldLight.ambi * u_MatlSet.ambi + u_headLight.ambi * u_MatlSet.ambi ;\n' +
    '  vec3 diffuse = u_worldLight.diff * v_Kd * nDotL + u_headLight.diff * v_Kd * nDotHl;\n' +
    '  vec3 speculr = u_worldLight.spec * u_MatlSet.spec * e64 + u_headLight.spec * u_MatlSet.spec * e64_2;\n' +

    '  v_Color = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +

  '}\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
//  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  'precision highp int;\n' +
//  '#endif GL_ES\n' +


	'struct LampT {\n' + // Describes one point-like Phong light source
    '  vec3 pos;\n' + // (x,y,z,w); w==1.0 for local light at x,y,z position
    '  vec3 ambi;\n' + // Ia ==  ambient light source strength (r,g,b)
    '  vec3 diff;\n' + // Id ==  diffuse light source strength (r,g,b)
    '  vec3 spec;\n' + // Is == specular light source strength (r,g,b)
    '}; \n' +
    'struct MatlT {\n' + // Describes one Phong material by its reflectances:
    '  vec3 emit;\n' + // Ke: emissive -- surface 'glow' amount (r,g,b);
    '  vec3 ambi;\n' + // Ka: ambient reflectance (r,g,b)
    '  vec3 diff;\n' + // Kd: diffuse reflectance (r,g,b)
    '  vec3 spec;\n' + // Ks: specular reflectance (r,g,b)
    '  int shiny;\n' + // Kshiny: specular exponent (integer >= 1; typ. <200)
    '};\n' +

  'varying vec4 v_Color;\n' +
  'varying vec3 normal;\n' +
  'varying vec4 vertexPosition;\n' +
  'varying vec3 v_Kd;\n' +
  'varying vec3 v_eyePosWorld;\n' +
  //'varying vec3 v_Ks;\n' +
  //'varying vec3 v_Ke;\n' +
  //Uniforms


  //Material uniforms
  'uniform MatlT u_MatlSet;\n' + // Array of all materials.

  //WorldLight and HeadLight Source uniforms
  'uniform LampT u_worldLight;\n' + // Array of all light sources.
  'uniform LampT u_headLight;\n' + // Array of all light sources.

  //Uniform to switch lighting modes
  'uniform int lightMode;\n' +
  'uniform int shadeMode;\n' +
  'uniform int headlightOn;\n' +
  'uniform int worldlightOn;\n' +
  //'varying vec2 v_worldlightOn;\n' +
  
  
  'void main() {\n' +
  ' if(shadeMode == 2){\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n'+
  
  ' if(shadeMode == 1){\n' +
  '  vec3 v_Normal = normalize(normal);\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_worldLight.pos - vec3(vertexPosition));\n' +
  '  vec3 hLightDirection = normalize(u_headLight.pos - vec3(vertexPosition));\n' +
  '  vec3 eyeDirection = normalize(v_eyePosWorld.xyz - vec3(vertexPosition)); \n' +
     // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, v_Normal), 0.0);\n' +
  '  float nDotHl = max(dot(hLightDirection, v_Normal),0.0);\n' +
  '  float nDotH = 0.0; \n' +
  '  float nDotH_2 = 0.0; \n' +
  
  
  '    if(lightMode == 1){\n' +
    //Blinn-Phong Lighting
    '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '  nDotH = max(dot(H, v_Normal), 0.0); \n' +
    '  vec3 H_2 = normalize(hLightDirection + eyeDirection); \n' +
    '  nDotH_2 = max(dot(H_2, v_Normal), 0.0); \n' + 
  '    }\n' +
  
  
  //Phong Lighting
  'if(lightMode == 2){\n' +	
  //worldLight
    '      vec3 L = normalize(lightDirection); \n' +
    '      vec3 C = dot(v_Normal, L)*v_Normal; \n' +
    '      vec3 R = C + C - L; \n' +
	'      nDotH = max(dot(eyeDirection, R), 0.0); \n' +
    //headLight	
	'      vec3 L_2 = normalize(hLightDirection); \n' +
    '      vec3 C_2 = dot(v_Normal, L_2)*v_Normal; \n' +
    '      vec3 R_2 = C_2 + C_2 - L_2; \n' +
	'      nDotH_2 = max(dot(eyeDirection, R_2), 0.0); \n' +
   '}\n' +  
   
   '  float e64 = pow(nDotH, float(u_MatlSet.shiny));\n' +
   '  float e64_2 = pow(nDotH_2, float(u_MatlSet.shiny));\n' +
    '  vec3 emissive = 	u_MatlSet.emit;\n' +
    '  vec3 ambient = u_worldLight.ambi * u_MatlSet.ambi + u_headLight.ambi * u_MatlSet.ambi ;\n' +
    '  vec3 diffuse = u_worldLight.diff * v_Kd * nDotL + u_headLight.diff * v_Kd * nDotHl;\n' +
    '  vec3 speculr = u_worldLight.spec * u_MatlSet.spec * e64 + u_headLight.spec * u_MatlSet.spec * e64_2;\n' +

    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
  
  '}\n' +
  '}\n';

// Global Variables----------------------------------
var canvas;		// main() sets this to the HTML-5 'canvas' element used for WebGL.
var gl;				// main() sets this to the rendering context for WebGL. This object
// holds ALL webGL functions as its members; I make it global here because we
// nearly all our program's functions need it to make WebGL calls.  All those
// functions would need 'gl' as an argument if we didn't make it a global var.
var u_modelMatrix;     // **GPU location** of the 'u_modelMatrix' uniform
var u_NormalMatrix ;
var modelMatrix = new Matrix4();
var normalMatrix = new Matrix4(); 
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var mvpMatrix = new Matrix4();


var MOVE_STEP = 0.15;
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)
var ANGLE_STEP_2 = 20.0;   // A different Rotation angle rate (degrees/second)
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
var g_theta = -25.59;
var userHeight=0;
var currentHeight=0;
var eyePosWorld = new Float32Array(3);
var flag = -1;

var g_LambAtX = 5.0,
    g_LambAtY = 5.0,
    g_LambAtZ = 20.0;
var lampAmbiR = 1.0,
    lampAmbiG = 1.0,
    lampAmbiB = 1.0;
var lampDiffR = 1.0,
    lampDiffG = 1.0,
    lampDiffB = 1.0;
var lampSpecR = 1.0,
    lampSpecG = 1.0,
    lampSpecB = 1.0;
var u_Kd;


var u_LightMode;
var lMode = 1;
var maxModes = 2;

var u_ShadeMode;
var sMode = 1;
var maxsModes = 2;
													// (x,y,z,w)position + (r,g,b)color
													// Later, see if you can add:
													// (x,y,z) surface normal + (tx,ty) texture addr.
var g_angle01 = 0.0;        // animation angle 01 (degrees)
var g_angle02 = 0.0;        // animation angle 02 (degrees)
var g_last = Date.now();

var height_steps = 0.1;

var headlightOn = true;
var worldlightOn = true;

var hlOn;
var wlOn;

	//------------For mouse click-and-drag: -------------------------------
var g_isDrag=false;		// mouse-drag: true when user holds down mouse button
var g_xMclik=0.0;			// last mouse button-down position (in CVV coords)
var g_yMclik=0.0;
var g_xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var g_yMdragTot=0.0;
var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();				// rotation matrix, made from latest qTot



var g_EyeX = -25.20, g_EyeY = 10.25, g_EyeZ = 6.0;
var g_AtX =0;
var g_AtY =0;
var g_AtZ = 5.9;
var foward_dis = 0;
var worldLight_1 = new LightsT();
var headLight = new LightsT();
var materialType = 1;
var g_ShaderID1;


function main() {
//==============================================================================
   window.addEventListener("keydown", myKeyDown, false);
   window.addEventListener("keyup", myKeyUp, false);
   window.addEventListener("mousedown", myMouseDown);
   window.addEventListener("mousemove", myMouseMove);
	window.addEventListener("click", myMouseClick);
	//canvas.onmousedown	=	function(ev){myMouseDown( ev, gl, canvas) }; 
  					// when user's mouse button goes down, call mouseDown() function
    //canvas.onmousemove = 	function(ev){myMouseMove( ev, gl, canvas) };
											// when the mouse moves, call mouseMove() function					
    //canvas.onmouseup = 		function(ev){myMouseUp(   ev, gl, canvas)};

  // Retrieve <canvas> element
   canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  document.onkeydown= function(ev){keydown(ev); };
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
	g_ShaderID1 = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE); // for VBO1,
    
  // Initialize shaders
    if (!g_ShaderID1) {
        console.log('Failed to intialize shaders.');
        return;
    }
  //
	gl.useProgram(g_ShaderID1);
  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.1, 0.1, 1.0);

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel
	// unless the new Z value is closer to the eye than the old one..
//	gl.depthFunc(gl.LESS);			 // WebGL default setting: (default)
	 gl.enable(gl.DEPTH_TEST);

  // Get handle to graphics system's storage location of u_modelMatrix

  
  hlOn = gl.getUniformLocation(g_ShaderID1, 'headlightOn');
  wlOn = gl.getUniformLocation(g_ShaderID1, 'worldlightOn');
  
  u_LightMode = gl.getUniformLocation(g_ShaderID1, 'lightMode');
  u_ShadeMode = gl.getUniformLocation(g_ShaderID1, 'shadeMode');

  
  u_modelMatrix = gl.getUniformLocation(g_ShaderID1, 'u_modelMatrix');
  u_NormalMatrix = gl.getUniformLocation(g_ShaderID1, 'u_NormalMatrix');
  u_eyePosWorld = gl.getUniformLocation(g_ShaderID1, 'u_eyePosWorld');

  gl.uniform3f(u_eyePosWorld, g_EyeX, g_EyeY, g_EyeZ);
//-----------------

  tick();							// start (and continue) animation: draw current image

}

function tick(){
  var now = Date.now();
	var nuCanvas = document.getElementById('webgl');	// get current canvas

  var lighting = lMode==1 ? "Blinn-Phong" : "Phong";
  var shading = sMode == 1 ? "Phong" : "Gouraud"; 

  document.getElementById('current_mode').innerHTML=
      'Current Shading & Lighting Method: '+shading+' Shading + '+ lighting +' Lighting';
	nuCanvas.width = innerWidth;
	nuCanvas.height = innerHeight*3/4;
	gl = getWebGLContext(nuCanvas);

    //gl.uniform3f(u_HeadlightPosition, g_EyeX, g_EyeY, g_EyeZ);
  	gl.uniform1i(u_LightMode, lMode);
	gl.uniform1i(u_ShadeMode, sMode);
    animate();  // Update the rotation angle
    drawAll();   // Draw shapes
	onSubmit();
	ANGLE_STEP.toFixed(5);
		 //Also display our current mouse-dragging state:
		
	g_xMdragTot.toFixed(5);
	g_yMdragTot.toFixed(5);
    // report current angle on console
    //console.log('currentAngle=',currentAngle);
    requestAnimationFrame(tick, canvas);
    currentHeight = animateHeight(currentHeight,now);
    									// Request that the browser re-draw the webpage
}

function animate() {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  //if(g_angle01 >  45.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  //if(g_angle01 < -25.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  if(g_angle02 >  40.0 && ANGLE_STEP_2 > 0) ANGLE_STEP_2 = -ANGLE_STEP_2;
  if(g_angle02 < -50.0 && ANGLE_STEP_2 < 0) ANGLE_STEP_2 = -ANGLE_STEP_2;

  g_angle01 = g_angle01 + (ANGLE_STEP * elapsed) / 1000.0;
  g_angle02 = g_angle02 + (ANGLE_STEP_2 * elapsed) / 1000.0;
}

function initVertexBuffer(gl) {
//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.

 	// Make each 3D shape in its own array of vertices:
  makeCylinder();					// create, fill the cylVerts array
  makeSphere();
  makeCylinder2();
  makeTorus2();						// create, fill the torVerts array
  makeGroundGrid();				// create, fill the gndVerts array
  makeAxes();
  makeRectangle();
  makePolygon();
  makeDiamond();
  // how many floats total needed to store all shapes?
	var mySiz = (cylVerts.length + cylVerts2.length + sphVerts.length +
							 torVerts.length + gndVerts.length + AxesVerts.length + RecVerts.length+Polys.length + DiamondVerts.length);

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
	// Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	cylStart = 0;							// we stored the cylinder first.
  for(i=0,j=0; j< cylVerts.length; i++,j++) {
  	colorShapes[i] = cylVerts[j];
		}
		sphStart = i;						// next, we'll store the sphere;
	for(j=0; j< sphVerts.length; i++, j++) {// don't initialize i -- reuse it!
		colorShapes[i] = sphVerts[j];
		}
		cyl2Start = i;							// we stored the cylinder first.
	for(j=0; j< cylVerts2.length; i++,j++) {
  	colorShapes[i] = cylVerts2[j];
		}
		torStart = i;						// next, we'll store the torus;
	for(j=0; j< torVerts.length; i++, j++) {
		colorShapes[i] = torVerts[j];
		}
		gndStart = i;						// next we'll store the ground-plane;
	for(j=0; j< gndVerts.length; i++, j++) {
		colorShapes[i] = gndVerts[j];
		}
		axeStart = i;						// next we'll store the ground-plane;
	for(j=0; j< AxesVerts.length; i++, j++) {
		colorShapes[i] = AxesVerts[j];
		}
		recStart = i;						// next we'll store the ground-plane;
	for(j=0; j< RecVerts.length; i++, j++) {
		colorShapes[i] = RecVerts[j];
		}
		polyStart = i;
	for(j=0; j< Polys.length; i++, j++) {
	colorShapes[i] = Polys[j];
	}
	diamondStart = i;
	for(j=0; j< DiamondVerts.length; i++, j++) {
	colorShapes[i] = DiamondVerts[j];
	}
  // Create a buffer object on the graphics hardware:
  var shapeBufferHandle = gl.createBuffer();
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  //Get graphics system's handle for our Vertex Shader's position-input variable:
  var a_Position = gl.getAttribLocation(g_ShaderID1, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

  // Use handle to specify how to retrieve **POSITION** data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * floatsPerVertex, // Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  		0);						// Offset -- now many bytes from START of buffer to the
  									// value we will actually use?
  gl.enableVertexAttribArray(a_Position);
  									// Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Normal = gl.getAttribLocation(g_ShaderID1, 'a_Normal');
  if(a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return -1;
  }
  // Use handle to specify how to retrieve **COLOR** data from our VBO:
  gl.vertexAttribPointer(
  	a_Normal, 				// choose Vertex Shader attribute to fill with data
  	3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
  	gl.FLOAT, 			// data type for each value: usually gl.FLOAT
  	false, 					// did we supply fixed-point data AND it needs normalizing?
  	FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  	FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w

  gl.enableVertexAttribArray(a_Normal);
  									// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}





function makeDiamond() {
	DiamondVerts = new Float32Array([
	//Simple Diamond

    //1+

    0.0, 0.0, 0.0,1.0,    0.0,0.8,0.8, //node0
    1.0,0.0, 0.0,1.0,    0.0,0.8,0.8, //node1
    0.5, 0.0, -1.0,1.0,  1.0,0.8,0.8, //node2

    1.0,0.0, 0.0,1.0,    1.0,0.8,0.8, //node1
    0.5, 0.0, -1.0,1.0,  0.0,0.8,0.8, //node2
    0.0,-1.0,0.0,1.0,    1.0,0.8,0.8,//node7


    //2+
    0.5, 0.0, -1.0,1.0,  0.8,0.8,0.8, //node2
    -0.5, 0.0, -1.0,1.0,  0.0,0.8,0.8, //node3
    0.0, 0.0, 0.0,1.0,    0.0,0.8,0.8, //node0

    0.5, 0.0, -1.0,1.0,  0.8,0.8,0.8, //node2
    -0.5, 0.0, -1.0,1.0,  0.8,0.8,0.8, //node3
    0.0,-1.0,0.0,1.0,    0.0,0.8,0.8,//node7

  
    //3+

    0.0, 0.0, 0.0,1.0,    0.8,0.8,0.8, //node0
    -1.0,0.0, 0.0,1.0,    0.0,0.8,0.8, //node4
    -0.5, 0.0, -1.0,1.0,  0.0,0.8,0.8, //node3

    -1.0,0.0, 0.0,1.0,    0.8,0.8,0.8, //node4
    -0.5, 0.0, -1.0,1.0,  0.0,0.8,0.8, //node3
    0.0,-1.0,0.0, 1.0,   0.8,0.8,0.8,//node7


    //4+

    0.0, 0.0, 0.0,1.0,    0.0,0.8,0.8, //node0
    1.0,0.0, 0.0,1.0,    0.0,0.8,0.8, //node1
    0.5, 0.0, 1.0,1.0,  0.8,0.8,0.8, //node6

    1.0,0.0, 0.0,1.0,    0.8,0.8,0.8, //node1
    0.5, 0.0, 1.0,1.0,  0.0,0.8,0.8, //node6
    0.0,-1.0,0.0,1.0,    0.0,0.8,0.8,//node7


    //5+
    0.5, 0.0, -1.0,1.0,  0.0,0.8,0.8, //node6
    -0.5, 0.0, 1.0,1.0,  1.0,0.8,0.8, //node5
    0.0, 0.0, 0.0,1.0,    1.0,0.8,0.8, //node0

    0.5, 0.0, 1.0,1.0,  0.8,0.8,0.8, //node6
    -0.5, 0.0, 1.0, 1.0, 0.8,0.8,0.8, //node5
    0.0,-1.0,0.0,1.0,    0.8,0.8,0.8,//node7

  
    //6+

    0.0, 0.0, 0.0,1.0,    0.0,0.8,0.8, //node0
    -1.0,0.0, 0.0,1.0,    1.0,0.8,0.8, //node4
    -0.5, 0.0, 1.0,1.0,  0.0,0.8,0.8, //node5

    -1.0,0.0, 0.0,1.0,    1.0,0.8,0.8, //node4
    -0.5, 0.0, 1.0,1.0,  0.0,0.8,0.8, //node5
    0.0,-1.0,0.0,1.0,    0.8,0.8,0.8,//node7

	]);
//==============================================================================
// Make a 4-cornered pyramid from one OpenGL TRIANGLE_STRIP primitive.
// All vertex coords are +/1 or zero; pyramid base is in xy plane.

  	// YOU write this one...
}


function makeRectangle() {
	RecVerts = new Float32Array([
	    //rectagle
    1.0, -2.0, -1.0, 1.0,    0.5, 1.0, 0.0,  // Node 3
    1.0,  2.0, -1.0, 1.0,    0.0, 1.0, 0.8,  // Node 2
    1.0,  2.0,  1.0, 1.0,    0.0, 0.0, 1.0,  // Node 4

    1.0,  2.0,  1.0, 1.0,    0.5, 1.0, 0.0,  // Node 4
    1.0, -2.0,  1.0, 1.0,    0.0, 1.0, 0.8,  // Node 7
    1.0, -2.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // Node 3

    // +y face: GREEN
    -1.0,  2.0, -1.0, 1.0,    1.0, 0.0, 0.0,  // Node 1
    -1.0,  2.0,  1.0, 1.0,    1.0, 1.0, 0.0,  // Node 5
     1.0,  2.0,  1.0, 1.0,    0.0, 1.0, 0.0,  // Node 4

     1.0,  2.0,  1.0, 1.0,    1.0, 0.1, 0.1,  // Node 4
     1.0,  2.0, -1.0, 1.0,    1.0, 0.1, 0.1,  // Node 2 
    -1.0,  2.0, -1.0, 1.0,    1.0, 0.0, 1.0,  // Node 1

    // +z face: BLUE Done

    -1.0,  2.0,  1.0, 1.0,    0.1, 0.1, 1.0,  // Node 5
    -1.0, -2.0,  1.0, 1.0,    1.0, 1.0, 0.1, // Node 6
     1.0, -2.0,  1.0, 1.0,    1.0, 0.1, 0.1,  // Node 7

     1.0, -2.0,  1.0, 1.0,    1.0, 0.1, 0.1,  // Node 7
     1.0,  2.0,  1.0, 1.0,    0.0, 1.0, 0.1,   // Node 4
    -1.0,  2.0,  1.0, 1.0,    0.1, 0.1, 1.0,  // Node 5

    // -x face: CYAN
    -1.0, -2.0,  1.0, 1.0,    0.0, 0.0, 1.0,  // Node 6 
    -1.0,  2.0,  1.0, 1.0,    1.0, 0.0, 0.0,// Node 5 
    -1.0,  2.0, -1.0, 1.0,    0.5, 0.0, 1.0,  // Node 1
    
    -1.0,  2.0, -1.0, 1.0,    1.0, 0.0, 0.0,  // Node 1
    -1.0, -2.0, -1.0, 1.0,    0.5, 0.0, 0.1,   // Node 0  
    -1.0, -2.0,  1.0, 1.0,    0.0, 0.0, 1.0,  // Node 6  
    
    // -y face: MAGENTA
     1.0, -2.0, -1.0, 1.0,    0.0, 1.0, 0.0,  // Node 3
     1.0, -2.0,  1.0, 1.0,    1.0, 1.0, 0.0,  // Node 7
    -1.0, -2.0,  1.0, 1.0,    1.0, 0.0, 0.0,  // Node 6

    -1.0, -2.0,  1.0, 1.0,    1.0, 0.0, 0.0,  // Node 6
    -1.0, -2.0, -1.0, 1.0,    1.0, 0.0, 1.0,  // Node 0
     1.0, -2.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // Node 3

     // -z face: YELLOW
     1.0,  2.0, -1.0, 1.0,    1.0, 0.0, 0.0,  // Node 2
     1.0, -2.0, -1.0, 1.0,    1.0, 1.0, 0.0,  // Node 3
    -1.0, -2.0, -1.0, 1.0,    0.0, 1.0, 0.0,  // Node 0   

    -1.0, -2.0, -1.0, 1.0,    0.0, 1.0, 1.0,  // Node 0
    -1.0,  2.0, -1.0, 1.0,    0.0, 0.0, 1.0,  // Node 1
     1.0,  2.0, -1.0, 1.0,    0.5, 0.2, 1.0,  // Node 2
	]);
//==============================================================================
// Make a 4-cornered pyramid from one OpenGL TRIANGLE_STRIP primitive.
// All vertex coords are +/1 or zero; pyramid base is in xy plane.

  	// YOU write this one...
}

function makePolygon() {
	Polys = new Float32Array([
	
     //Polygon
    //RED  
    0.5, 0.0, 1.0, 1.0,   1.0, 0.0, 0.0,// NODE 1
    -0.5, 0.0, 1.0, 1.0,  1.0, 0.0, 0.0,// NODE 2
    -0.5, 2.0, 1.0, 1.0,  1.0, 1.0, 0.0,// NODE 10
    
    -0.5, 2.0, 1.0, 1.0,  1.0, 1.0, 0.0,// NODE 10 
    0.5, 2.0, 1.0, 1.0,   1.0, 0.0, 1.0,// NODE 9
    0.5, 0.0, 1.0, 1.0,   1.0, 0.0, 0.0,// NODE 1

    1.0, 0.0, 0.5, 1.0,   0.35, 0.5, 1.0,//NODE 0
    0.5, 0.0, 1.0, 1.0,   0.6, 0.0, 0.5,// NODE 1
    0.5, 2.0, 1.0, 1.0,   1.0, 0.0, 0.0,// NODE 9
    
    0.5, 2.0, 1.0, 1.0,   1.0, 0.1, 0.1,// NODE 9
    1.0, 2.0, 0.5,1.0,    1.0, 0.1, 0.1, //NODE 8
    1.0, 0.0, 0.5, 1.0,   1.0, 0.0, 1.0,//NODE 0
    

    //GREEN

    -1.0, 0.0, 0.5, 1.0,  0.0, 0.6, 0.0,// NODE 3
    -1.0, 0.0, -0.5, 1.0, 1.0, 0.3, 0.0,// NODE 4
    -1.0, 2.0, -0.5, 1.0, 1.0, 0.0, 0.3,// NODE 12
    
    -1.0, 2.0, -0.5, 1.0, 1.0, 0.0, 0.6,// NODE 12
    -1.0, 2.0, 0.5, 1.0,  1.0, 0.5, 0.0,// NODE 11
    -1.0, 0.0, 0.5, 1.0,  0.1, 0.0, 0.0,// NODE 3


    -0.5, 0.0, 1.0, 1.0,    0.4, 0.5, 0.5,// NODE 2
    -1.0, 0.0, 0.5, 1.0,    0.5, 0.5, 0.5,// NODE 3
    -1.0, 2.0, 0.5, 1.0,    0.1, 1.0, 0.5,// NODE 11

    -1.0, 2.0, 0.5, 1.0,    0.3, 1.0, 0.5,// NODE 11
    -0.5, 2.0, 1.0, 1.0,    0.1, 0.1, 0.5,// NODE 10
    -0.5, 0.0, 1.0, 1.0,    0.1, 1.0, 0.1,// NODE 2


        //BLUE
    -1.0, 0.0, -0.5, 1.0,   0.0, 0.5, 1.0,// NODE 4
    -0.5, 0.0, -1.0, 1.0,   0.2, 0.3, 1.0,// NODE 5
    -0.5, 2.0, -1.0, 1.0,   0.0, 0.75, 1.0,// NODE 13

    -0.5, 2.0, -1.0, 1.0,   0.1, 0.1, 1.0,// NODE 13
    -1.0, 2.0, -0.5, 1.0,   0.1, 0.1, 1.0,// NODE 12
    -1.0, 0.0, -0.5, 1.0,   0.1, 0.1, 1.0,// NODE 4

    -0.5, 0.0, -1.0, 1.0, 1.0, 0.2, 0.76,// NODE 5
    0.5, 0.0, -1.0, 1.0,  1.0, 0.0, 0.0,// NODE 6
    0.5, 2.0, -1.0, 1.0,  1.0, 0.0, 0.0,// NODE 14
    
    0.5, 2.0, -1.0, 1.0,  1.0, 0.0, 0.75,// NODE 14
    -0.5, 2.0, -1.0, 1.0, 1.0, 0.0, 0.4,// NODE 13
    -0.5, 0.0, -1.0, 1.0, 1.0, 0.0, 0.75,// NODE 5
      
    
    //CYAN
    0.5, 0.0, -1.0, 1.0,  0.0, 0.5, 1.0,// NODE 6
    1.0, 0.0, -0.5, 1.0,  0.0, 1.0, 1.0,// NODE 7
    1.0, 2.0, -0.5, 1.0,  0.0, 1.0, 1.0,// NODE 15
    
    1.0, 2.0, -0.5, 1.0,  0.1, 1.0, 1.0,// NODE 15
    0.5, 2.0, -1.0, 1.0,  0.1, 0.5, 1.0,// NODE 14
    0.5, 0.0, -1.0, 1.0,  0.1, 0.5, 0.1,// NODE 6
  

    1.0, 0.0, -0.5, 1.0,    0.0, 0.0, 1.0,// NODE 7
    1.0, 0.0, 0.5, 1.0,     1.0, 0.0, 1.0,//NODE 0
    1.0, 2.0, 0.5, 1.0,    1.0, 0.1, 0.1, //NODE 8

    1.0, 2.0, 0.5, 1.0,    1.0, 0.1, 0.1, //NODE 8
    1.0, 2.0, -0.5, 1.0,    0.1, 1.0, 1.0,// NODE 15
    1.0, 0.0, -0.5, 1.0,    0.0, 1.0, 1.0,// NODE 7

	]);
//==============================================================================
// Make a 4-cornered pyramid from one OpenGL TRIANGLE_STRIP primitive.
// All vertex coords are +/1 or zero; pyramid base is in xy plane.

  	// YOU write this one...
}

function makeAxes() {
//==============================================================================
// Make a cube with 4 triangles for each of its 6 faces, and with separately-
// specified colors for each faces' center and 4 corners.
// Create a (global) array to hold all of three axe's vertices;
		 AxesVerts = new Float32Array([
		     	// Drawing Axes: Draw them using gl.LINES drawing primitive;
     	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
		 0.0,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// 						 (endpoint: red)
		 
		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  1.0,	// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,	//						 (endpoint: blue)
		 ]);// YOU write this one...
}

function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design (Method 2) described in the class lecture notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//

 var topColr = new Float32Array([0.8, 0.8, 0.8]);	// light yellow top,
 var walColr = new Float32Array([0.8, 0.2, 0.0]);	// red walls,
 var botColr = new Float32Array([0.8, 0.8, 0.0]);	// yellow bottom,
 var ctrColr = new Float32Array([0.8, 0.8, 0.0]); // near white end-cap centers,
 var errColr = new Float32Array([0.8, 0.8, 0.0]);	// Bright-red trouble color.

 var capVerts = 100;	// # of vertices around the topmost 'cap' of the shape
 var topRadius = 0.5;		// radius of top of cylinder (bottom is always 1.0)

 // Create a (global) array to hold all of this cylinder's vertices;
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
 // # of vertices * # of elements needed to store them. How many vertices?
										// Cylinder bottom end-cap:   (2*capVerts) -1  vertices;
 										// (includes blue transition-edge that links end-cap & wall);
 										// + Cylinder wall requires   (2*capVerts) vertices;
 										// + Cylinder top end-cap:    (2*capVerts) -1 vertices
 										// (includes green transition-edge that links wall & endcap).

	// Create circle-shaped bottom cap of cylinder at z=-1.0, radius 1.0,
	// with (capVerts*2)-1 vertices, BUT STOP before you create it's last vertex.
	// That last vertex forms the 'transition' edge from the bottom cap to the
	// wall (shown in blue in lecture notes), & we make it in the next for() loop.
	//
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=0,j=0;   v<(2*capVerts)-1;   v++,j+=floatsPerVertex) {
		// START at vertex v = 0; on x-axis on end-cap's outer edge, at xyz = 1,0,-1.
		// END at the vertex 2*(capVerts-1), the last outer-edge vertex before
		// we reach the starting vertex at 1,0,-1.
		if(v%2 ==0)
		{				// put even# vertices around bottom cap's outer edge,starting at v=0.
						// visit each outer-edge location only once; don't return to
						// to the location of the v=0 vertex (at 1,0,-1).
						// x,y,z,w == cos(theta),sin(theta),-1.0, 1.0,
						// 		where	theta = 2*PI*((v/2)/capVerts) = PI*v/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*v/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*v/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts,
			//	 so we can simplify cos(2*PI * (v/(2*capVerts))
			cylVerts[j+2] =-2.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = botColr[]
			cylVerts[j+4]=botColr[0];
			cylVerts[j+5]=botColr[1];
			cylVerts[j+6]=botColr[2];
		}
		else {	// put odd# vertices at center of cylinder's bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1; centered on z axis at -1.
			cylVerts[j+1] = 0.0;
			cylVerts[j+2] =-2.0;
			cylVerts[j+3] = 1.0;			// r,g,b = ctrColr[]
			cylVerts[j+4]=ctrColr[0];
			cylVerts[j+5]=ctrColr[1];
			cylVerts[j+6]=ctrColr[2];
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	// START with the vertex at 1,0,-1 (completes the cylinder's bottom cap;
	// completes the 'transition edge' drawn in blue in lecture notes).
	for(v=0; v< 2*capVerts;   v++, j+=floatsPerVertex) {
		if(v%2==0)	// count verts from zero again,
								// and put all even# verts along outer edge of bottom cap:
		{
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] =-2.0;	// ==z  BOTTOM cap,
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = walColr[]
				cylVerts[j+4]=walColr[0];
				cylVerts[j+5]=walColr[1];
				cylVerts[j+6]=walColr[2];
			if(v==0) {		// UGLY TROUBLESOME vertex--shares its 1 color with THREE
										// triangles; 1 in cap, 1 in step, 1 in wall.
					cylVerts[j+4] = errColr[0];
					cylVerts[j+5] = errColr[1];
					cylVerts[j+6] = errColr[2];		// (make it red; see lecture notes)
				}
		}
		else		// position all odd# vertices along the top cap (not yet created)
		{
				cylVerts[j  ] = topRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = topRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] = 2.0;	// == z TOP cap,
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = walColr;
				cylVerts[j+4]=walColr[0];
				cylVerts[j+5]=walColr[1];
				cylVerts[j+6]=walColr[2];
		}
	}
	// Complete the cylinder with its top cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements.
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		// count vertices from zero again, and
		if(v%2==0) {	// position even #'d vertices around top cap's outer edge.
			cylVerts[j  ] = topRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = topRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] = 2.0;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=topColr[0];
			cylVerts[j+5]=topColr[1];
			cylVerts[j+6]=topColr[2];
			if(v==0) {	// UGLY TROUBLESOME vertex--shares its 1 color with THREE
										// triangles; 1 in cap, 1 in step, 1 in wall.
					cylVerts[j+4] = errColr[0];
					cylVerts[j+5] = errColr[1];
					cylVerts[j+6] = errColr[2];		// (make it red; see lecture notes)
			}
		}
		else {				// position odd#'d vertices at center of the top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;
			cylVerts[j+2] = 2.0;
			cylVerts[j+3] = 1.0;
			// r,g,b = topColr[]
			cylVerts[j+4]=ctrColr[0];
			cylVerts[j+5]=ctrColr[1];
			cylVerts[j+6]=ctrColr[2];
		}
	}
}

function makeCylinder2() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design (Method 2) described in the class lecture notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//

 var topColr = new Float32Array([0.8, 0.8, 0.8]);	// light yellow top,
 var walColr = new Float32Array([0.8, 0.2, 0.0]);	// dark green walls,
 var botColr = new Float32Array([0.8, 0.8, 0.0]);	// light blue bottom,
 var ctrColr = new Float32Array([0.8, 0.8, 0.0]); // near black end-cap centers,
 var errColr = new Float32Array([0.8, 0.8, 0.0]);	// Bright-red trouble color.

 var capVerts = 100;	// # of vertices around the topmost 'cap' of the shape
 var topRadius = 1.0;		// radius of top of cylinder (bottom is always 1.0)

 // Create a (global) array to hold all of this cylinder's vertices;
 cylVerts2 = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
 // # of vertices * # of elements needed to store them. How many vertices?
										// Cylinder bottom end-cap:   (2*capVerts) -1  vertices;
 										// (includes blue transition-edge that links end-cap & wall);
 										// + Cylinder wall requires   (2*capVerts) vertices;
 										// + Cylinder top end-cap:    (2*capVerts) -1 vertices
 										// (includes green transition-edge that links wall & endcap).

	// Create circle-shaped bottom cap of cylinder at z=-1.0, radius 1.0,
	// with (capVerts*2)-1 vertices, BUT STOP before you create it's last vertex.
	// That last vertex forms the 'transition' edge from the bottom cap to the
	// wall (shown in blue in lecture notes), & we make it in the next for() loop.
	//
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=0,j=0;   v<(2*capVerts)-1;   v++,j+=floatsPerVertex) {
		// START at vertex v = 0; on x-axis on end-cap's outer edge, at xyz = 1,0,-1.
		// END at the vertex 2*(capVerts-1), the last outer-edge vertex before
		// we reach the starting vertex at 1,0,-1.
		if(v%2 ==0)
		{				// put even# vertices around bottom cap's outer edge,starting at v=0.
						// visit each outer-edge location only once; don't return to
						// to the location of the v=0 vertex (at 1,0,-1).
						// x,y,z,w == cos(theta),sin(theta),-1.0, 1.0,
						// 		where	theta = 2*PI*((v/2)/capVerts) = PI*v/capVerts
			cylVerts2[j  ] = Math.cos(Math.PI*v/capVerts);			// x
			cylVerts2[j+1] = Math.sin(Math.PI*v/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts,
			//	 so we can simplify cos(2*PI * (v/(2*capVerts))
			cylVerts2[j+2] =-1.0;	// z
			cylVerts2[j+3] = 1.0;	// w.
			// r,g,b = botColr[]
			cylVerts2[j+4]=botColr[0];
			cylVerts2[j+5]=botColr[1];
			cylVerts2[j+6]=botColr[2];
		}
		else {	// put odd# vertices at center of cylinder's bottom cap:
			cylVerts2[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1; centered on z axis at -1.
			cylVerts2[j+1] = 0.0;
			cylVerts2[j+2] =-1.0;
			cylVerts2[j+3] = 1.0;			// r,g,b = ctrColr[]
			cylVerts2[j+4]=ctrColr[0];
			cylVerts2[j+5]=ctrColr[1];
			cylVerts2[j+6]=ctrColr[2];
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	// START with the vertex at 1,0,-1 (completes the cylinder's bottom cap;
	// completes the 'transition edge' drawn in blue in lecture notes).
	for(v=0; v< 2*capVerts;   v++, j+=floatsPerVertex) {
		if(v%2==0)	// count verts from zero again,
								// and put all even# verts along outer edge of bottom cap:
		{
				cylVerts2[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts2[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts2[j+2] =-1.0;	// ==z  BOTTOM cap,
				cylVerts2[j+3] = 1.0;	// w.
				// r,g,b = walColr[]
				cylVerts2[j+4]=walColr[0];
				cylVerts2[j+5]=walColr[1];
				cylVerts2[j+6]=walColr[2];
			if(v==0) {		// UGLY TROUBLESOME vertex--shares its 1 color with THREE
										// triangles; 1 in cap, 1 in step, 1 in wall.
					cylVerts2[j+4] = errColr[0];
					cylVerts2[j+5] = errColr[1];
					cylVerts2[j+6] = errColr[2];		// (make it red; see lecture notes)
				}
		}
		else		// position all odd# vertices along the top cap (not yet created)
		{
				cylVerts2[j  ] = topRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts2[j+1] = topRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts2[j+2] = 1.0;	// == z TOP cap,
				cylVerts2[j+3] = 1.0;	// w.
				// r,g,b = walColr;
				cylVerts2[j+4]=walColr[0];
				cylVerts2[j+5]=walColr[1];
				cylVerts2[j+6]=walColr[2];
		}
	}
	// Complete the cylinder with its top cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements.
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		// count vertices from zero again, and
		if(v%2==0) {	// position even #'d vertices around top cap's outer edge.
			cylVerts2[j  ] = topRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts2[j+1] = topRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts2[j+2] = 1.0;	// z
			cylVerts2[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts2[j+4]=topColr[0];
			cylVerts2[j+5]=topColr[1];
			cylVerts2[j+6]=topColr[2];
			if(v==0) {	// UGLY TROUBLESOME vertex--shares its 1 color with THREE
										// triangles; 1 in cap, 1 in step, 1 in wall.
					cylVerts2[j+4] = errColr[0];
					cylVerts2[j+5] = errColr[1];
					cylVerts2[j+6] = errColr[2];		// (make it red; see lecture notes)
			}
		}
		else {				// position odd#'d vertices at center of the top cap:
			cylVerts2[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts2[j+1] = 0.0;
			cylVerts2[j+2] = 1.0;
			cylVerts2[j+3] = 1.0;
			// r,g,b = topColr[]
			cylVerts2[j+4]=ctrColr[0];
			cylVerts2[j+5]=ctrColr[1];
			cylVerts2[j+6]=ctrColr[2];
		}
	}
}



function makeSphere() {
    //==============================================================================
    // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like
    // equal-lattitude 'slices' of the sphere (bounded by planes of constant z),
    // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
    // sphere from one triangle strip.
    var slices = 19; // # of slices of the sphere along the z axis. >=3 req'd
    // (choose odd # or prime# to avoid accidental symmetry)
    var sliceVerts = 27; // # of vertices around the top edge of the slice
    // (same number of vertices on bottom of slice, too)
    // var topColr = new Float32Array([0.7, 0.7, 0.7]); // North Pole: light gray
    // var equColr = new Float32Array([0.3, 0.7, 0.3]); // Equator:    bright green
    // var botColr = new Float32Array([0.9, 0.9, 0.9]); // South Pole: brightest gray.
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    sphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
    // # of vertices * # of elements needed to store them.
    // each slice requires 2*sliceVerts vertices except 1st and
    // last ones, which require only 2*sliceVerts-1.

    // Create dome-shaped top slice of sphere at z=+1
    // s counts slices; v counts vertices;
    // j counts array elements (vertices * elements per vertex)
    var cos0 = 0.0; // sines,cosines of slice's top, bottom edge.
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))
                sphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts[j + 2] = cos0;
                sphVerts[j + 3] = 1.0;
                sphVerts[j + 4] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts[j + 5] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts[j + 6] = cos0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                //          theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                sphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts[j + 2] = cos1; // z
                sphVerts[j + 3] = 1.0; // w.
                sphVerts[j + 4] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts[j + 5] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts[j + 6] = cos1; // z
            }
            // if (s == 0) { // finally, set some interesting colors for vertices:
            //     sphVerts[j + 4] = topColr[0];
            //     sphVerts[j + 5] = topColr[1];
            //     sphVerts[j + 6] = topColr[2];
            // } else if (s == slices - 1) {
            //     sphVerts[j + 4] = botColr[0];
            //     sphVerts[j + 5] = botColr[1];
            //     sphVerts[j + 6] = botColr[2];
            // } else {
            //     sphVerts[j + 4] = Math.random(); // equColr[0];
            //     sphVerts[j + 5] = Math.random(); // equColr[1];
            //     sphVerts[j + 6] = Math.random(); // equColr[2];
            // }
        }
    }
}

function makeTorus2() {
//==============================================================================
// Make a torus from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design (Method 2) described in the class lecture notes.
//
// (NOTE: you'll get better-looking results if you create a 'makeSphere3()
// function that uses the 'degenerate stepped spiral' design (Method 3).
//
// 	Imagine a torus as a flexible, cylinder-shaped rod or tube bent into a
// circle around the z-axis. The bent tube's centerline forms a circle
// entirely in the z=0 plane, centered at the origin, with radius 'rBend'.
// Angle 'theta' measures position along the circle: it beings at theta=0 at
// the point (rBend,0,0) on the +x axis, and as theta grows greater than zero
// the circle extends in the counter-clockwise (CCW) or right-handed direction
// of rotation, moving towards the +y axis where theta will reach +90deg.,
// consistent with all the other right-handed coordinate systems.
// 		This bent tube forms a torus because the tube itself has a circular cross-
// section with radius 'rTube' , and we measure position on that circle by the
// angle 'phi'. Again we use the right-handed coordinate system to define 'phi':
// it measures angle in the CCW direction around the tube's centerline, circling
// right-handed along the direction of increasing theta.
// 	For example theta=0, phi=0 selects the torus surface point (rBend+rTube,0,0);
// a slight increase in angle phi moves the point in -z direction and a slight
// increase in theta moves that point in circularly towards the +y axis.
// To construct the torus,
// --we begin with the circle that forms the starting edge of the tube,
// where theta == 0 (e.g. the torus surface within the y=0 plane)
//					xc = rBend + rTube*cos(phi); 		// tube's circular crossection
//					yc = 0;
//					zc = -rTube*sin(phi);			(note NEGATIVE sin() this ensures that
//																		 increasing phi moves CCW around the torus
//                                     center-line direction, now at (0,+1,0)
// and then rotate the circle given by xc,yc,zc around the z-axis by angle theta:
//					x = xc*cos(theta) - yc*sin(theta)  // (contents of a 2D rot matrix)
//					y = xc*sin(theta) + yc*cos(theta)
//					z = zc
// Plug in the (xc,yc,zc) values from above & simplify. As yc==0, we can write:
//					x = (rBend + rTube*cos(phi))*cos(theta)
//					y = (rBend + rTube*cos(phi))*sin(theta)
//					z = -rTube*sin(phi)
//
var rTube = 0.5;										// Radius of the tube we bent to form a torus
var rBend = 1.0;										// Radius of circle made by tube's centerline
																		//(Set rTube <rBend to keep torus hole open!)
var tubeRings = 23;									// # of stepped-spiral rings(constant theta)
																		// along the entire length of the bent tube.
																		// (>=3 req'd: more for smoother bending)
var ringSides = 13;									// # of sides of each ring (and thus the
																		// number of vertices in their cross-section)
																		// >=3 req'd;more for rounder cross-sections)
// for nice-looking torus with approx square facets,
//			--choose odd or prime#  for ringSides, and
//			--choose odd or prime# for tubeRings of approx. ringSides *(rBend/rTube)
// EXAMPLE: rBend = 1, rTube = 0.5, tubeRings =23, ringSides = 11.

// Create a (global) array to hold this torus's vertices:
 torVerts = new Float32Array(floatsPerVertex*(2*ringSides*tubeRings +2));
//	Each slice requires 2*ringSides vertices, but 1st tubeRing will skip its
// first triangle where phi=0, leaving behind an empty triangular hole.
// Similarly, the last tubeRing will skip its last triangle. To 'close' the
// torus, we repeat the first 2 vertices at the end of the last tubeRing.
//  (Said another way: the first edge in the first tubeRing is parallel to
//
// the torus' center-line (an edge of constant phi), but that ring ends with a
// diagonal edge that goes up to the next ring, and leaves a triangular 'hole'.
// Similarly, the last edge of the last tubeRing is also parallel to the torus
// center-line. This leaves open 2 triangles.  We can fill them both by adding
// just 2 more vertices to the end of the triangle-strip, placed at the same
// location as the 1st two vertices in the triangle strip.)

var phi=0, theta=0;										// begin torus at angles 0,0
var thetaStep = 2*Math.PI/tubeRings;	// theta angle between each tube ring
var phiHalfStep = Math.PI/ringSides;	// half-phi angle between each ringSide
																			// (WHY HALF? 2 vertices per step in phi)
	// s counts rings along the tube;
	// v counts vertices within one ring (starts at 0 for each ring)
	// j counts array elements (vertices * floatsPerVertex) put in torVerts array.
	for(s=0,j=0; s<tubeRings; s++)
	{		// for each 'ring' of the torus:
		for(v=0; v< 2*ringSides; v++, j+=floatsPerVertex)
			{	// for each vertex in this segment:
			if(v%2==0)	{	// position the even #'d vertices at bottom of segment,
				torVerts[j  ] = (rBend + rTube*Math.cos((v)*phiHalfStep)) *
				                               Math.cos((s)*thetaStep);
							  //	x = (rBend + rTube*cos(phi)) * cos(theta)
				torVerts[j+1] = (rBend + rTube*Math.cos((v)*phiHalfStep)) *
				                               Math.sin((s)*thetaStep);
								//  y = (rBend + rTube*cos(phi)) * sin(theta)
				torVerts[j+2] = -rTube*Math.sin((v)*phiHalfStep);
								//  z = -rTube  *   sin(phi)
				torVerts[j+3] = 1.0;		// w
			}
			else {				// odd #'d vertices at top of slice (s+1);
										// at same phi used at bottom of slice (v-1)
				torVerts[j  ] = (rBend + rTube*Math.cos((v-1)*phiHalfStep)) *
                                       Math.cos((s+1)*thetaStep);
							  //	x = (rBend + rTube*cos(phi)) * cos(NextTheta)
				torVerts[j+1] = (rBend + rTube*Math.cos((v-1)*phiHalfStep)) *
				                               Math.sin((s+1)*thetaStep);
								//  y = (rBend + rTube*cos(phi)) * sin(NextTheta)
				torVerts[j+2] = -rTube*Math.sin((v-1)*phiHalfStep);
								//  z = -rTube  *   sin(phi)
				torVerts[j+3] = 1.0;		// w
			}
			if(v==0 && s!=0) {		// 'troublesome' vertex shared by step & 2 rings
				torVerts[j+4] = 1.0;		//  BRIGHT RED to show its location.
				torVerts[j+5] = 0.2;
				torVerts[j+6] = 0.2;
			}
			else {
				torVerts[j+4] = Math.random()/2;		// random color 0.0 <= R < 0.5
				torVerts[j+5] = Math.random()/2;		// random color 0.0 <= G < 0.5
				torVerts[j+6] = Math.random()/2;		// random color 0.0 <= B < 0.5
				}
		}
	}
	// Repeat the 1st 2 vertices of the triangle strip to complete the torus:
	// (curious? put these two vertices at the origin to see them on-screen)
			torVerts[j  ] = rBend + rTube;	// copy vertex zero;
						  //	x = (rBend + rTube*cos(phi==0)) * cos(theta==0)
			torVerts[j+1] = 0.0;
							//  y = (rBend + rTube*cos(phi==0)) * sin(theta==0)
			torVerts[j+2] = 0.0;
							//  z = -rTube  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random()/2;		// random color 0.0 <= R < 0.5
			torVerts[j+5] = Math.random()/2;		// random color 0.0 <= G < 0.5
			torVerts[j+6] = Math.random()/2;		// random color 0.0 <= B < 0.5
			j+=7; // go to next vertex:
			torVerts[j  ] = (rBend + rTube) * Math.cos(thetaStep);
						  //	x = (rBend + rBar*cos(phi==0)) * cos(theta==thetaStep)
			torVerts[j+1] = (rBend + rTube) * Math.sin(thetaStep);
							//  y = (rBend + rTube*cos(phi==0)) * sin(theta==thetaStep)
			torVerts[j+2] = 0.0;
							//  z = -rTube  *   sin(phi==0)
			torVerts[j+3] = 1.0;		// w
			torVerts[j+4] = Math.random()/2;		// random color 0.0 <= R < 0.5
			torVerts[j+5] = Math.random()/2;		// random color 0.0 <= G < 0.5
			torVerts[j+6] = Math.random()/2;		// random color 0.0 <= B < 0.5
			// DONE!
}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at the origin.  Draw this shape using the GL_LINES primitive.

	var xcount = 200;			// # of lines to draw in x,y to make the grid.
	var ycount = 200;
	var xymax	= 80.0;			// grid size; extends to cover +/-xymax in x and y.
    var xColr = 1;  
    var yColr = 1; 

	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.

	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))

	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = xColr;			// red
		gndVerts[j+5] = yColr;			// grn
		gndVerts[j+6] = 1;			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// w.
		}
		gndVerts[j+4] = xColr;			// red
		gndVerts[j+5] = yColr;			// grn
		gndVerts[j+6] = 1;			// blu
	}
}


function drawMySceneRepeat(gl,g_ShaderID, lamp, matl){
	u_ModelMatrix = gl.getUniformLocation(g_ShaderID, 'u_ModelMatrix');
    u_NormalMatrix = gl.getUniformLocation(g_ShaderID, 'u_NormalMatrix');
	u_eyePosWorld = gl.getUniformLocation(g_ShaderID, 'u_eyePosWorld');
    u_MvpMatrix = gl.getUniformLocation(g_ShaderID, 'u_MvpMatrix');
	
	
    gl.uniform3f(u_eyePosWorld, g_EyeX, g_EyeY, g_EyeZ);
  
	lamp.u_pos = gl.getUniformLocation(g_ShaderID, 'u_worldLight.pos');
    lamp.u_ambi = gl.getUniformLocation(g_ShaderID, 'u_worldLight.ambi');
    lamp.u_diff = gl.getUniformLocation(g_ShaderID, 'u_worldLight.diff');
    lamp.u_spec = gl.getUniformLocation(g_ShaderID, 'u_worldLight.spec');
	
	headLight.u_pos = gl.getUniformLocation(g_ShaderID, 'u_headLight.pos');
    headLight.u_ambi = gl.getUniformLocation(g_ShaderID, 'u_headLight.ambi');
    headLight.u_diff = gl.getUniformLocation(g_ShaderID, 'u_headLight.diff');
    headLight.u_spec = gl.getUniformLocation(g_ShaderID, 'u_headLight.spec');
	if (!lamp.u_pos || !lamp.u_ambi || !lamp.u_diff || !lamp.u_spec ||
        !headLight.u_pos || !headLight.u_ambi || !headLight.u_diff || !headLight.u_spec) {
        console.log('Failed to get GPUs lamp or headLight storage locations');
        return;
    }
	    // ... for Phong material/reflectance:
    matl.uLoc_Ke = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.emit');
    matl.uLoc_Ka = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.ambi');
    matl.uLoc_Kd = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.diff');
    matl.uLoc_Ks = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.spec');
    matl.uLoc_Kshiny = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.shiny');
    if (!matl.uLoc_Ke || !matl.uLoc_Ka || !matl.uLoc_Kd ||
        !matl.uLoc_Ks || !matl.uLoc_Kshiny
    ) {
        console.log('Failed to get GPUs Reflectance storage locations');
        return;
    }

	    lamp.I_pos.elements.set([g_LambAtX, g_LambAtY, g_LambAtZ]);
    if (worldlightOn) {
		gl.uniform1i(wlOn, 1);
        lamp.I_ambi.elements.set([lampAmbiR, lampAmbiG, lampAmbiB]);
        lamp.I_diff.elements.set([lampDiffR, lampDiffG, lampDiffB]);
        lamp.I_spec.elements.set([lampSpecR, lampSpecG, lampSpecB]);
        // console.log("lamp on");
    } else {
		gl.uniform1i(wlOn, 0);
        lamp.I_ambi.elements.set([0.0, 0.0, 0.0]);
        lamp.I_diff.elements.set([0.0, 0.0, 0.0]);
        lamp.I_spec.elements.set([0.0, 0.0, 0.0]);
        // console.log("lamp off");
    }

    // lamp.I_pos.elements.set([g_LambAtX, g_LambAtY, g_LambAtZ]);
    headLight.I_pos.elements.set([g_EyeX, g_EyeY, g_EyeZ]);
    if (headlightOn) {
		gl.uniform1i(hlOn,1);
        headLight.I_ambi.elements.set([1.0, 1.0, 1.0]);
        headLight.I_diff.elements.set([1.0, 1.0, 1.0]);
        headLight.I_spec.elements.set([1.0, 1.0, 1.0]);
        // console.log("lamp on");
    } else {
		gl.uniform1i(hlOn,0);
        headLight.I_ambi.elements.set([0.0, 0.0, 0.0]);
        headLight.I_diff.elements.set([0.0, 0.0, 0.0]);
        headLight.I_spec.elements.set([0.0, 0.0, 0.0]);
        // console.log("lamp off");
    }




    gl.uniform3fv(lamp.u_pos, lamp.I_pos.elements.slice(0, 3));
    gl.uniform3fv(lamp.u_ambi, lamp.I_ambi.elements); // ambient
    gl.uniform3fv(lamp.u_diff, lamp.I_diff.elements); // diffuse
    gl.uniform3fv(lamp.u_spec, lamp.I_spec.elements); // Specular
    gl.uniform3fv(headLight.u_pos, headLight.I_pos.elements.slice(0, 3));
    gl.uniform3fv(headLight.u_ambi, headLight.I_ambi.elements); // ambient
    gl.uniform3fv(headLight.u_diff, headLight.I_diff.elements); // diffuse
    gl.uniform3fv(headLight.u_spec, headLight.I_spec.elements); // Specular

    //---------------For the Material object(s):
    gl.uniform3fv(matl.uLoc_Ke, matl.K_emit.slice(0, 3)); // Ke emissive
    gl.uniform3fv(matl.uLoc_Ka, matl.K_ambi.slice(0, 3)); // Ka ambient
    gl.uniform3fv(matl.uLoc_Kd, matl.K_diff.slice(0, 3)); // Kd	diffuse
    gl.uniform3fv(matl.uLoc_Ks, matl.K_spec.slice(0, 3)); // Ks specular
    gl.uniform1i(matl.uLoc_Kshiny, parseInt(matl.K_shiny, 10)); // Kshiny
}


function drawAll(){
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
    g_AtX = g_EyeX +  Math.cos(g_theta * Math.PI/180);
    g_AtY = g_EyeY +  Math.sin(g_theta * Math.PI/180);
	gl.viewport(0,											 				// Viewport lower-left corner
							0, 			// location(in pixels)
  						gl.drawingBufferWidth, 					// viewport width,
  						gl.drawingBufferHeight);			// viewport height in pixels.
	viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
        g_AtX, g_AtY, g_AtZ, // look-at point
        0, 0, 1); // up vector  
	var vpAspect = gl.drawingBufferWidth /			// On-screen aspect ratio for
								(gl.drawingBufferHeight);		// this camera: width/height.
    projMatrix.setPerspective(30, vpAspect, 1, 100);
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	
	
	
	
	//gl.useProgram(g_ShaderID1);
	var matl_1 = new Material(19);
	drawMySceneRepeat(gl,g_ShaderID1, worldLight_1, matl_1);


	//console.log(g_theta);
	console.log(g_AtX);
	console.log(g_AtY);
	console.log(g_AtZ);
       // SAVE world coord system;
    modelMatrix.setTranslate( 0.4, -0.4, 0.0);
  	modelMatrix.scale(0.7, 0.7, 0.7);				// shrink by 10X:

	drawGrid();
	modelMatrix.scale(100, 100, 100);
	drawAxes();
	modelMatrix.scale(0.01, 0.01, 0.01);
	
	



  //===================Draw Sixth OBJECT(Rectangle):
     var matl_3 = new Material(2);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
    //draw tower1


  //draw tower
  //modelMatrix.translate( 0.4, -0.4, 0.0);

  modelMatrix.setTranslate(3,-10,3.9);
  modelMatrix.rotate(90,1,0,0);
  modelMatrix.rotate(-g_angle01,0,1,0);
  modelMatrix.rotate(180,0,1,0);
  modelMatrix.scale(5,5,5);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.2,-0.5,-0.2);
  modelMatrix.scale(0.1, 0.15, 0.1);
  drawRectangle();
  

//2
  var matl_3 = new Material(3);
  drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(0,-0.1,-0.2);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();

  //1
  var matl_3 = new Material(4);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(-0.2,-0.4,-0.2);
  modelMatrix.scale(0.1, 0.2, 0.1);
  drawRectangle();


//    //pos6
var matl_3 = new Material(5);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0.2,-0.1,0);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();
      // Draw just the first set of vertices: start at vertex 0...


//5
var matl_3 = new Material(6);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  modelMatrix.translate(0,0,0);
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.scale(0.1, 0.4, 0.1);
  drawRectangle();

  // //4
  var matl_3 = new Material(7);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(-0.2,-0.1,0);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();

   //pos9
   var matl_3 = new Material(8);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0.2,-0.4,0.2);
  modelMatrix.scale(0.1, 0.2, 0.1);
  drawRectangle();

  //8
  var matl_3 = new Material(9);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0,0,0.2);
  modelMatrix.scale(0.1, 0.4, 0.1);
  drawRectangle();


  //7
  var matl_3 = new Material(10);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(-0.2,-0.5,0.2);
  modelMatrix.scale(0.1, 0.15, 0.1);
  drawRectangle();


  var matl_3 = new Material(14);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0.8,0.2);
  modelMatrix.scale(0.09, 0.45, 0.09);
  modelMatrix.scale(0.09, 0.45, 0.09);
  // modelMatrix.scale(0.09, 0.45, 0.09);
  drawTentacle();

//tentacle 2
var matl_3 = new Material(12);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.01,0.8,-0.0);
  modelMatrix.scale(0.09, 0.45, 0.09);
  modelMatrix.scale(0.09, 0.45, 0.09);
  // modelMatrix.scale(0.09, 0.45, 0.09);
  drawTentacle();


  //===================Draw Seventh OBJECT(ring):

    var matl_2 = new Material(22);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_2);


    modelMatrix.setTranslate(-1,8,1);
    pushMatrix(modelMatrix);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01,0,1,0);
	drawDiamond();

	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
	modelMatrix.translate(0,0,1);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*2,0,1,0);
	drawDiamond();

	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
	modelMatrix.translate(0,0,2);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*3,0,1,0);
	drawDiamond();
	
	var matl_2 = new Material(6);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_2);

	modelMatrix = popMatrix();
	pushMatrix(modelMatrix);
	modelMatrix.translate(0,0,2.5);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*3,0,1,0);
    modelMatrix.scale(0.4,0.4,0.4);
	drawSphere();









  //===================Draw Sixth OBJECT(Rectangle):
     var matl_3 = new Material(2);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
    //draw tower1


  //draw tower
  //modelMatrix.translate( 0.4, -0.4, 0.0);

  modelMatrix.setTranslate(16,10,4);
  modelMatrix.rotate(90,1,0,0);
  // modelMatrix.rotate(-g_angle01,0,1,0);
  modelMatrix.rotate(180,0,1,0);
  modelMatrix.scale(5,5,5);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.2,-0.5,-0.2);
  modelMatrix.scale(0.1, 0.15, 0.1);
  drawRectangle();
  

//2
  var matl_3 = new Material(3);
  drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(0,-0.1,-0.2);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();

  //1
  var matl_3 = new Material(4);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(-0.2,-0.4,-0.2);
  modelMatrix.scale(0.1, 0.2, 0.1);
  drawRectangle();


//    //pos6
var matl_3 = new Material(5);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0.2,-0.1,0);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();
      // Draw just the first set of vertices: start at vertex 0...


//5
var matl_3 = new Material(6);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  modelMatrix.translate(0,0,0);
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.scale(0.1, 0.4, 0.1);
  drawRectangle();

  // //4
  var matl_3 = new Material(7);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(-0.2,-0.1,0);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();

   //pos9
   var matl_3 = new Material(8);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0.2,-0.4,0.2);
  modelMatrix.scale(0.1, 0.2, 0.1);
  drawRectangle();

  //8
  var matl_3 = new Material(9);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0,0,0.2);
  modelMatrix.scale(0.1, 0.4, 0.1);
  drawRectangle();


  //7
  var matl_3 = new Material(10);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(-0.2,-0.5,0.2);
  modelMatrix.scale(0.1, 0.15, 0.1);
  drawRectangle();


  var matl_3 = new Material(14);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0.8,0.2);
  modelMatrix.scale(0.09, 0.45, 0.09);
  modelMatrix.scale(0.09, 0.45, 0.09);
  // modelMatrix.scale(0.09, 0.45, 0.09);
  drawTentacle();

//tentacle 2
var matl_3 = new Material(12);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.01,0.8,-0.0);
  modelMatrix.scale(0.09, 0.45, 0.09);
  modelMatrix.scale(0.09, 0.45, 0.09);
  // modelMatrix.scale(0.09, 0.45, 0.09);
  drawTentacle();


  //===================Draw Seventh OBJECT(ring):

    var matl_2 = new Material(22);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_2);


    modelMatrix.setTranslate(-1,8,1);
    pushMatrix(modelMatrix);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01,0,1,0);
  drawDiamond();

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0,1);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*2,0,1,0);
  drawDiamond();

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0,2);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*3,0,1,0);
  drawDiamond();
  
  var matl_2 = new Material(6);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_2);

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0,2.5);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*3,0,1,0);
    modelMatrix.scale(0.4,0.4,0.4);
  drawSphere();





// third tower


  //===================Draw Sixth OBJECT(Rectangle):
     var matl_3 = new Material(2);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
    //draw tower1


  //draw tower
  //modelMatrix.translate( 0.4, -0.4, 0.0);

  modelMatrix.setTranslate(16,3,4);
  modelMatrix.rotate(90,1,0,0);
  // modelMatrix.rotate(-g_angle01,0,1,0);
  modelMatrix.rotate(180,0,1,0);
  modelMatrix.scale(5,5,5);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.2,-0.5,-0.2);
  modelMatrix.scale(0.1, 0.15, 0.1);
  drawRectangle();
  

//2
  var matl_3 = new Material(3);
  drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(0,-0.1,-0.2);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();

  //1
  var matl_3 = new Material(4);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(-0.2,-0.4,-0.2);
  modelMatrix.scale(0.1, 0.2, 0.1);
  drawRectangle();


//    //pos6
var matl_3 = new Material(5);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0.2,-0.1,0);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();
      // Draw just the first set of vertices: start at vertex 0...


//5
var matl_3 = new Material(6);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  modelMatrix.translate(0,0,0);
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.scale(0.1, 0.4, 0.1);
  drawRectangle();

  // //4
  var matl_3 = new Material(7);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0)
  modelMatrix.translate(-0.2,-0.1,0);
  modelMatrix.scale(0.1, 0.35, 0.1);
  drawRectangle();

   //pos9
   var matl_3 = new Material(8);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0.2,-0.4,0.2);
  modelMatrix.scale(0.1, 0.2, 0.1);
  drawRectangle();

  //8
  var matl_3 = new Material(9);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(0,0,0.2);
  modelMatrix.scale(0.1, 0.4, 0.1);
  drawRectangle();


  //7
  var matl_3 = new Material(10);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  //modelMatrix.rotate(-currentAngle,1,1,0);
  
  modelMatrix.translate(-0.2,-0.5,0.2);
  modelMatrix.scale(0.1, 0.15, 0.1);
  drawRectangle();


  var matl_3 = new Material(14);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0.8,0.2);
  modelMatrix.scale(0.09, 0.45, 0.09);
  modelMatrix.scale(0.09, 0.45, 0.09);
  // modelMatrix.scale(0.09, 0.45, 0.09);
  drawTentacle();

//tentacle 2
var matl_3 = new Material(12);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_3);
  modelMatrix=popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.01,0.8,-0.0);
  modelMatrix.scale(0.09, 0.45, 0.09);
  modelMatrix.scale(0.09, 0.45, 0.09);
  // modelMatrix.scale(0.09, 0.45, 0.09);
  drawTentacle();


  //===================Draw Seventh OBJECT(ring):

    var matl_2 = new Material(22);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_2);


    modelMatrix.setTranslate(-1,8,1);
    pushMatrix(modelMatrix);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01,0,1,0);
  drawDiamond();

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0,1);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*2,0,1,0);
  drawDiamond();

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0,2);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*3,0,1,0);
  drawDiamond();
  
  var matl_2 = new Material(6);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_2);

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0,0,2.5);
    modelMatrix.rotate(90,1,0,0);
    modelMatrix.rotate(-g_angle01*3,0,1,0);
    modelMatrix.scale(0.4,0.4,0.4);
  drawSphere();





//===================Draw Eighth OBJECT(Big Sphere):
    var matl_1 = new Material(materialType);
    drawMySceneRepeat(gl, g_ShaderID1,worldLight_1, matl_1);

					  
    modelMatrix.setTranslate(0,0,3);
    modelMatrix.rotate(-g_angle01,0,0,1);
    
	modelMatrix.scale(3,3,3);
	drawSphere();
  
  
}





function drawDiamond(){


	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Draw just the the cylinder's vertices:

    gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
  							diamondStart/floatsPerVertex, // start at this vertex number, and
  							DiamondVerts.length/floatsPerVertex);	// draw this many vertices.
}


function drawCylinder(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);
  // Draw just the the cylinder's vertices:

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cylStart/floatsPerVertex, // start at this vertex number, and
  							cylVerts.length/floatsPerVertex);	// draw this many vertices.
}

function drawTentacle(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Draw just the the cylinder's vertices:

    gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
  							polyStart/floatsPerVertex, // start at this vertex number, and
  							Polys.length/floatsPerVertex);	// draw this many vertices.
}

function drawCylinder2(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Draw just the the cylinder's vertices:

    gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cyl2Start/floatsPerVertex, // start at this vertex number, and
  							cylVerts2.length/floatsPerVertex);	// draw this many vertices.
}

function drawGrid(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	 gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

   normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
     // Draw just the ground-plane's vertices

     gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
  						  gndStart/floatsPerVertex,	// start at this vertex number, and
  						  gndVerts.length/floatsPerVertex);	// draw this many vertices.

}

function drawTorus(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  		// Draw just the torus's vertices

    gl.drawArrays(gl.TRIANGLE_STRIP, 				// use this drawing primitive, and
  						  torStart/floatsPerVertex,	// start at this vertex number, and
  						  torVerts.length/floatsPerVertex);	// draw this many vertices.
}

function drawSphere(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  		// Draw just the sphere's vertices

   gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							sphStart/floatsPerVertex,	// start at this vertex number, and
  							sphVerts.length/floatsPerVertex);	// draw this many vertices.
}

function drawAxes(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  		// Draw just the sphere's vertices
   gl.drawArrays(gl.LINES,				// use this drawing primitive, and
  							axeStart/floatsPerVertex,	// start at this vertex number, and
  							AxesVerts.length/floatsPerVertex);	// draw this many vertices.
}

function drawRectangle(){
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  		// Draw just the sphere's vertices

   gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
  							recStart/floatsPerVertex,	// start at this vertex number, and
  							RecVerts.length/floatsPerVertex);	// draw this many vertices.
}


 //==================HTML Button Callbacks======================

function heightSubmit() {


var old_height = currentHeight;

var new_height = parseFloat(document.getElementById('usrHeight').value);

// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='editBoxOut':

ANGLE_STEP = new_height;

}

function animateHeight(current, now){
var elapsed = now - g_last;
g_last = now;

var new_height;


if (ANGLE_STEP>=800){

    new_height = current + (height_steps * elapsed)/2 ;
  
}
else{
	if(currentHeight < 0 ){
		new_height = current - (height_steps * elapsed)/2 ;
	}
  
  else{new_height=current;}
}

return new_height;
}





function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.
  ANGLE_STEP += 25;
  ANGLE_STEP_2 -= 25;
}

function spinDown() {
// Called when user presses the 'Spin <<' button
 ANGLE_STEP -= 25;
 ANGLE_STEP_2 -= 25;

}

function runStop() {
// Called when user presses the 'Run/Stop' button
  if(ANGLE_STEP*ANGLE_STEP > 1 || ANGLE_STEP_2*ANGLE_STEP_2 > 1 ) {  // if nonzero rate,
    myTmp = ANGLE_STEP;  // store the current rate,
    ANGLE_STEP = 0;      // and set to zero.
	myTmp_2 = ANGLE_STEP_2;  // store the current rate,
    ANGLE_STEP_2 = 0;      // and set to zero.
  }
  else {    // but if rate is zero,
  	ANGLE_STEP = myTmp;  // use the stored rate.
	ANGLE_STEP_2 = myTmp_2;  // use the stored rate.
  }
}

  //===================Mouse and Keyboard event-handling Callbacks

  function myMouseDown(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);

	g_isDrag = true;											// set our mouse-dragging flag
	g_xMclik = x;													// record where mouse-dragging began
	g_yMclik = y;
	// report on webpage
	
	x.toFixed(5);
	y.toFixed(5);
};




  function myMouseMove(ev) {

//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

	if(g_isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	g_xMdragTot += (x - g_xMclik);					// Accumulate change-in-mouse-position,&
	g_yMdragTot += (y - g_yMclik);
	dragQuat(x - g_xMclik, y - g_yMclik);
	// Report new mouse position & how far we moved on webpage:
	
	g_xMdragTot.toFixed(5);
	g_yMdragTot.toFixed(5);
	/*document.getElementById('MouseDragResult').innerHTML =
	  'Mouse Drag: '+(x - g_xMclik).toFixed(5)+', '+(y - g_yMclik).toFixed(5);*/

	g_xMclik = x;													// Make next drag-measurement from here.
	g_yMclik = y;
};

function myMouseUp(ev) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);

	g_isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	g_xMdragTot += (x - g_xMclik);
	g_yMdragTot += (y - g_yMclik);
	dragQuat(x - g_xMclik, y - g_yMclik);
	// Report new mouse position:
	
	g_xMdragTot.toFixed(5)
	g_yMdragTot.toFixed(5);	
	
};

function myMouseClick(ev) {



//=============================================================================
// Called when user completes a mouse-button single-click event
// (e.g. mouse-button pressed down, then released)
//
//    WHICH button? try:  console.log('ev.button='+ev.button);
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
}

function dragQuat(xdrag, ydrag) {
//==============================================================================
// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
// We find a rotation axis perpendicular to the drag direction, and convert the 
// drag distance to an angular rotation amount, and use both to set the value of 
// the quaternion qNew.  We then combine this new rotation with the current 
// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
// 'draw()' function converts this current 'qTot' quaternion to a rotation 
// matrix for drawing. 
	var res = 5;
	var qTmp = new Quaternion(0,0,0,1);
	
	var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
	// console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
	qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
	// (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
							// why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
							// -- to rotate around +x axis, drag mouse in -y direction.
							// -- to rotate around +y axis, drag mouse in +x direction.
							
	qTmp.multiply(qNew,qTot);			// apply new rotation to current rotation. 
	//--------------------------
	// IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
	// ANSWER: Because 'duality' governs ALL transformations, not just matrices. 
	// If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
	// first by qTot, and then by qNew--we would apply mouse-dragging rotations
	// to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
	// rotations FIRST, before we apply rotations from all the previous dragging.
	//------------------------
	// IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store 
	// them with finite precision. While the product of two (EXACTLY) unit-length
	// quaternions will always be another unit-length quaternion, the qTmp length
	// may drift away from 1.0 if we repeat this quaternion multiply many times.
	// A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
	// Matrix4.prototype.setFromQuat().
//	qTmp.normalize();						// normalize to ensure we stay at length==1.0.
	qTot.copy(qTmp);
	// show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
	
	qTot.x.toFixed(res)
	qTot.y.toFixed(res)
	qTot.z.toFixed(res)
	qTot.w.toFixed(res)
	qTot.length().toFixed(res);
};



function myKeyDown(kev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard;
//
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of a mess of JavaScript keyboard event handling,
// see:    http://javascript.info/tutorial/keyboard-events
//
// NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
//        'keydown' event deprecated several read-only properties I used
//        previously, including kev.charCode, kev.keyCode.
//        Revised 2/2019:  use kev.key and kev.code instead.
//
// Report EVERYTHING in console:


// and report EVERYTHING on webpage:
	
	switch(kev.code) {
		
		//------------------WASD navigation-----------------
		case "KeyA":
			console.log("a/A key: Strafe LEFT!\n");
			

			break;
    case "KeyD":
			console.log("d/D key: Strafe RIGHT!\n");
			

			break;
		case "KeyS":
			console.log("s/S key: Move BACK!\n");
			

			break;
		case "KeyW":
			console.log("w/W key: Move FWD!\n");
			

			break;
		//----------------Arrow keys------------------------
		case "ArrowLeft":
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		

			break;
		case "ArrowRight":
			console.log('right-arrow.');
  		

  		break;
		case "ArrowUp":
			console.log('   up-arrow.');
  		

			break;
		case "ArrowDown":
			console.log(' down-arrow.');
  		

  		break;
    default:
      console.log("UNUSED!");
  		

      break;
	}
}

function onSubmit() {

    lampAmbiR = Number(document.getElementById("lampAmbiR").value);
    lampAmbiG = Number(document.getElementById("lampAmbiG").value);
    lampAmbiB = Number(document.getElementById("lampAmbiB").value);
    lampDiffR = Number(document.getElementById("lampDiffR").value);
    lampDiffG = Number(document.getElementById("lampDiffG").value);
    lampDiffB = Number(document.getElementById("lampDiffB").value);
    lampSpecR = Number(document.getElementById("lampSpecR").value);
    lampSpecG = Number(document.getElementById("lampSpecG").value);
    lampSpecB = Number(document.getElementById("lampSpecB").value);

}

function keydown(ev, gl, u_ViewMatrix, viewMatrix) {
//------------------------------------------------------
//HTML calls this'Event handler' or 'callback function' when we press a key:

	var dx = g_EyeX - g_AtX;
	var dy = g_EyeY - g_AtY;
	var dz = g_EyeZ - g_AtZ;
	
    var abs_l = Math.sqrt(dx*dx + dy*dy + dz*dz);
    var abs_xy = Math.sqrt(dx*dx + dy*dy);

    if (ev.keyCode==13){
      if (headlightOn)
          headlightOn = false;
      else
          headlightOn = true;
    }else

    if (ev.keyCode == 32){
      if(worldlightOn){
        worldlightOn = false;
      }
      else 
        worldlightOn = true;
    }else

	if (ev.keyCode == 78){
		switchsModes();
	}else
	
	if (ev.keyCode == 77 ){
		switchlModes();
	}else
		
    if (ev.keyCode == 66){
        materialType = (materialType + 1) % 20;
       // console.log("change the material");
    } else

	if(ev.keyCode == 38) { // The up arrow key was pressed
	
				g_AtZ = g_AtZ + 0.1;

				// g_EyeZ -= 0.1;				// INCREASED for perspective camera)
    } else
		
	if (ev.keyCode == 40) { // The down arrow key was pressed
//      g_EyeX -= 0.01;

				g_AtZ = g_AtZ - 0.1;		// INCREASED for perspective camera)
    } else
		
    if(ev.keyCode == 39) { // The right arrow key was pressed
	g_theta = g_theta - 5;
			//console.log(g_theta);
    } else
		
    if (ev.keyCode == 37) { // The left arrow key was pressed
	g_theta = g_theta + 5;
    }else

    if(ev.keyCode == 87){ // w go forward
    	g_EyeX -= 0.1*(dx/abs_l);
    	g_EyeZ -= 0.1*(dz/abs_l);
    	g_EyeY-= 0.1*(dy/abs_l);
		
    	g_AtX -= 0.1*(dx/abs_l);
    	g_AtZ -= 0.1*(dz/abs_l);
    	g_AtY -= 0.1*(dy/abs_l);
    }else

    if(ev.keyCode == 83){ // s go backward

    	g_EyeX += 0.1*(dx/abs_l);
    	g_EyeZ += 0.1*(dz/abs_l);
    	g_EyeY += 0.1*(dy/abs_l);

 
    	g_AtX += 0.1*(dx/abs_l);
    	g_AtZ += 0.1*(dz/abs_l);
    	g_AtY += 0.1*(dy/abs_l);
    	

    }else
    
    if (ev.keyCode == 68){  //a
    		g_EyeX -= 0.1 * dy / abs_xy;
            g_EyeY += 0.1 * dx / abs_xy;
			
            g_AtX -= 0.1 * dy / abs_xy;
            g_AtY += 0.1 * dx / abs_xy;
    }else


    if (ev.keyCode == 65){  //d
    		g_EyeX +=  0.1 * dy / abs_xy;
            g_EyeY -=  0.1 * dx / abs_xy;
			
            g_AtX += 0.1 * dy /  abs_xy;
            g_AtY -= 0.1 * dx /  abs_xy;
}else
	if (ev.keyCode == 73) {
        g_LambAtX += MOVE_STEP;
        // g_LambAtY -= MOVE_STEP;
    } else
    if (ev.keyCode == 75) {
        g_LambAtX -= MOVE_STEP;
        // g_LambAtY += MOVE_STEP;
    } else
    if (ev.keyCode ==74) {
        // g_LambAtX += MOVE_STEP * look[0];
        g_LambAtY += MOVE_STEP;
    } else
    if (ev.keyCode == 76) {
        // g_LambAtX -= MOVE_STEP;
        g_LambAtY -= MOVE_STEP;
    } 

    else { return; } // Prevent the unnecessary drawing
    drawAll();
}

function switchlModes() {
    if (lMode == maxModes) {
        lMode = 1;
    }
    else
        lMode++;
}

function switchsModes() {
    if (sMode == maxsModes) {
        sMode = 1;
    }
    else
        sMode++;
	//console.log(sMode);
}


function myKeyUp(kev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

	//console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
}
