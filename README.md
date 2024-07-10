# DocumentosCaso

Solucion al caso de Planteado en clases.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:
- Node.js
- RabbitMQ

## Correr el siguiente comando en el Powershell para crear el contenedor con el servicio de RabbitMQ
docker run -d -p 15672:15672 -p 5672:5672 --name some-rabbit rabbitmq:3-management

## Igresar a RabbitMQ

http://localhost:15672

user: guest
password: guest

## Crear Usuarios en para los servicios entrando a ADMIN

username: send password: send conf pass: send

tags: administrator

permisos: set permission

username: receptor password: receptor conf pass: receptor

tags: administrator

permisos: set permission

username: state password: state conf pass: state

tags: administrator

permisos: set permission

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local:


