# Perspectiva en WebGL

La versión web de este proyecto se encuentra en [este sandbox de codesandbox](https://n76qrr.csb.app/).

El código se puede acceder desde [este enlace](https://codesandbox.io/p/sandbox/webgl-practica-4-n76qrr).

## Ejecución del proyecto en local

A continuación, se detallan las instrucciones de ejecución del proyecto de forma local en caso de que la version web fallara.

1. Descargar o clonar el repositorio

2. Descargar e instalar la version mas reciente de ``Node.js`` desde [este enlace](https://nodejs.org/en)

3. Para asegurar que la instalación se realizó correctamente utilizar los siguientes comandos en un terminal o símbolo del sistema:

```
node --version
npm --version
```

4. Una vez correctamente instalado ejecutar el siguiente comando desde un terminal o símbolo del sistema en el directorio o carpeta en el que se encuentre el proyecto:

```
npm install
```

5. Una vez termine el comando anterior ejecutar el siguiente comando desde el mismo terminal o simbolo del sístema:

```
npm run start
```

6. Una vez ejecutado este comando se observará en la consola algo parecido a esto:
```
> webgl_p4@1.0.0 start
> parcel ./src/index.html

Server running at http://localhost:1234
```

7. Abrir un navegador y, en la barra de direcciones, escribir ```localhost:1234```

8. Para terminar la simulación, pulsar la combinación de botones ```Ctrl + C``` en la consola donde se realizó el paso 5

## Controles de la simulación

La simulación se controla con las siguientes teclas:

1. ```Flecha hacia arriba```: Mueve el jugador hacía delante.
2. ```Fecha hacia abajo```: Mueve el jugador hacía atrás.
3. ```Flecha hacía la izquierda```: Rota la cámara hacía la izquierda.
4. ```Flecha hacía la derecha```: Rota la cámara hacía la derecha.
5. ```Tecla A```: Mueve la cámara hacía arriba.
6. ```Tecla Z```: Mueve la cámara hacía abajo.
7. ```Tecla Mayus```: Aumenta la velocidad del jugador y la cámara mientras se mantenga pulsada.
8. ```Tecla Espacio```: Dispara una bala en la dirección en la que mira el jugador.

Además, hay disponible una interfaz gráfica con las siguientes opciones:

1. ```speed```: Modifica la velocidad de los objetos de la escena y la bala disparada por el jugador.
2. ```isChasing```: Habilita que el cubo blanco que hay en la escena persiga al jugador.