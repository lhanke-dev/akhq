#!/bin/bash
VALIDITY=3650
PASSWORD=changeit
keytool -keystore kafka.server.keystore.jks -alias kafkaserver -keyalg RSA -validity ${VALIDITY} -genkey -storepass ${PASSWORD} -dname "CN=kafka-server.ssl.dev"
openssl req -new -x509 -keyout ca-key -out ca-cert -days ${VALIDITY} -passout pass:${PASSWORD}
keytool -keystore kafka.client.truststore.jks -alias CARoot -importcert -file ca-cert -storepass ${PASSWORD}
keytool -keystore kafka.server.truststore.jks -alias CARoot -importcert -file ca-cert -storepass ${PASSWORD}
keytool -keystore kafka.server.keystore.jks -alias kafkaserver -certreq -file cert-file -storepass ${PASSWORD}
openssl x509 -req -CA ca-cert -CAkey ca-key -in cert-file -out cert-signed -days ${VALIDITY} -CAcreateserial -passin pass:${PASSWORD}
keytool -keystore kafka.server.keystore.jks -alias CARoot -importcert -file ca-cert -storepass ${PASSWORD}
keytool -keystore kafka.server.keystore.jks -alias kafkaserver -importcert -file cert-signed -storepass ${PASSWORD}