#!/bin/bash
VALIDITY=3650
PASSWORD=changeit
export MSYS_NO_PATHCONV=1

# ca
openssl req -new -x509 -keyout ca-key -out ca-cert -days ${VALIDITY} -passout pass:${PASSWORD} -subj "/C=AB/ST=State/L=City/O=Organization/OU=Organizational Unit/CN=ssl.dev"

keytool -keystore kafka.server.keystore.jks -alias kafkaserver -keyalg RSA -validity ${VALIDITY} -genkey -storepass ${PASSWORD} -dname "CN=kafka-server.ssl.dev, OU=, O=, L=, S=, C="
keytool -keystore kafka.client.keystore.jks -alias kafkaclient -keyalg RSA -validity ${VALIDITY} -genkey -storepass ${PASSWORD} -dname "CN=kafka-client.ssl.dev, OU=, O=, L=, S=, C="

# import ca-root to truststore
keytool -keystore kafka.client.truststore.jks -alias CARoot -importcert -noprompt -file ca-cert -storepass ${PASSWORD}
keytool -keystore kafka.server.truststore.jks -alias CARoot -importcert -noprompt -file ca-cert -storepass ${PASSWORD}

# server certreq
keytool -keystore kafka.server.keystore.jks -alias kafkaserver -certreq -file kafka-server.csr -storepass ${PASSWORD}
openssl x509 -req -CA ca-cert -CAkey ca-key -in kafka-server.csr -out kafka-server.cert -days ${VALIDITY} -CAcreateserial -passin pass:${PASSWORD}
keytool -keystore kafka.server.keystore.jks -alias CARoot -importcert -noprompt -file ca-cert -storepass ${PASSWORD}
keytool -keystore kafka.server.keystore.jks -alias kafkaserver -importcert -noprompt -file kafka-server.cert -storepass ${PASSWORD}

# client certreq
keytool -keystore kafka.client.keystore.jks -alias kafkaclient -certreq -file kafka-client.csr -storepass ${PASSWORD}
openssl x509 -req -CA ca-cert -CAkey ca-key -in kafka-client.csr -out kafka-client.cert -days ${VALIDITY} -CAcreateserial -passin pass:${PASSWORD}
keytool -keystore kafka.client.keystore.jks -alias CARoot -importcert -noprompt -file ca-cert -storepass ${PASSWORD}
keytool -keystore kafka.client.keystore.jks -alias kafkaclient -importcert -noprompt -file kafka-client.cert -storepass ${PASSWORD}

rm ca-cert ca-key ca-cert.srl kafka-server.csr kafka-server.cert kafka-client.csr kafka-client.cert