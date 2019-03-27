/// <reference path="webgl.d.ts" />

let cube = class {
  constructor(gl, pos) {
    this.texture = loadTexture(gl, 'tie.jpg');
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    this.positions = [
      // Front face
      -0.4, -0.4, 0.4,
      0.4, -0.4, 0.4,
      0.4, 0.4, 0.4,
      -0.4, 0.4, 0.4,
      //Back Face
      -0.4, -0.4, -0.4,
      0.4, -0.4, -0.4,
      0.4, 0.4, -0.4,
      -0.4, 0.4, -0.4,
      //Top Face
      -0.4, 0.4, -0.4,
      0.4, 0.4, -0.4,
      0.4, 0.4, 0.4,
      -0.4, 0.4, 0.4,
      //Bottom Face
      -0.4, -0.4, -0.4,
      0.4, -0.4, -0.4,
      0.4, -0.4, 0.4,
      -0.4, -0.4, 0.4,
      //Left Face
      -0.4, -0.4, -0.4,
      -0.4, 0.4, -0.4,
      -0.4, 0.4, 0.4,
      -0.4, -0.4, 0.4,
      //Right Face
      0.4, -0.4, -0.4,
      0.4, 0.4, -0.4,
      0.4, 0.4, 0.4,
      0.4, -0.4, 0.4,

    ];
    // var n = 100;
    // for (var i = 0; i <= 360; i += 360 / n) {
    //   this.positions.push(0, 0, 0);
    //   this.positions.push(0.3 * Math.cos((M_PI * i) / 180), 0.8 + 0.3 * Math.sin((M_PI * i) / 180), 0);
    //   this.positions.push(0.3 * Math.cos(M_PI * ((i + 360 / n) / 180)), 0.8 + 0.3 * Math.sin(M_PI * ((i + 360 / n) / 180)), 0);
    //   this.positions.push(0.3 * Math.cos(M_PI * ((i + 720 / n) / 180)), 0.8 + 0.3 * Math.sin(M_PI * ((i + 720 / n) / 180)), 0);
    //   // console.log("AAA");
    // }

    this.acc = -0.0001;
    this.rotation = 0;
    this.speed_x = 0;
    this.speed_z = -0.09;
    this.speed_y = 0;
    this.gravity = -0.01;
    this.pos = pos;
    this.sz = this.positions.length / 3
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.positions),
      gl.STATIC_DRAW
    );



    // this.faceColors = [
    //   [1, 0, 0, 1], // Left face: purple
    //   [Math.random(), Math.random(), Math.random(), Math.random()], // Left face: purple
    //   [Math.random(), Math.random(), Math.random(), Math.random()], // Left face: purple
    //   [Math.random(), Math.random(), Math.random(), Math.random()], // Left face: purple
    //   [Math.random(), Math.random(), Math.random(), Math.random()], // Left face: purple
    //   [Math.random(), Math.random(), Math.random(), Math.random()] // Left face: purple
    // ];

    // var colors = [];

    // for (var j = 0; j < this.faceColors.length; ++j) {
    //   const c = this.faceColors[j];

    //   // Repeat each color four times for the four vertices of the face
    //   colors = colors.concat(c, c, c, c);
    // }

    // const colorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    var textureCoordinates = [];
    for (var i = 0; i < this.positions.length; i += 4) {
      textureCoordinates.push(0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
      gl.STATIC_DRAW);




    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    var indices = [];
    for (var i = 0; i < this.sz; i += 4) {
      indices.push(i)
      indices.push(i + 1)
      indices.push(i + 2)
      indices.push(i)
      indices.push(i + 2)
      indices.push(i + 3)
    }
    // Now send the element array to GL

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );

    this.buffer = {
      position: this.positionBuffer,
      textureCoord: textureCoordBuffer,
      indices: indexBuffer
    };
  }

  drawCube(gl, projectionMatrix, programInfo, deltaTime) {
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, this.pos);

    //this.rotation += Math.PI / (((Math.random()) % 100) + 50);

    mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation, [1, 1, 1]);

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.textureCoord);
      gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
    }


    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);


    {
      const vertexCount = this.positions.length / 2;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
  tick(in_air) {
    this.speed_z += this.acc;
    this.pos[2] += this.speed_z;
    if (this.pos[0] + this.speed_x <= -1.75) {
      this.pos[0] = -1.75;
      this.speed_x = 0;
    }
    if (this.pos[0] + this.speed_x >= 1.75) {
      this.pos[0] = 1.75;
      this.speed_x = 0;
    }
    this.pos[0] += this.speed_x;
    if (in_air == 0) {
      if (this.pos[1] + this.speed_y <= 0.8) {
        this.pos[1] = 0.8;
        this.speed_y = 0;
      }
      this.pos[1] += this.speed_y;
      this.speed_y += this.gravity;
    }
    else {
      this.pos[1] = 4.0;
    }
  }
};
