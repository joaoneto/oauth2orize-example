#!/bin/bash

COOKIE_TMP_FILE=".tmp_cookie"

USER_EMAIL="foo@example.com"
USER_PASSWORD="123"

CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXX"
CLIENT_SECRET="abc123"
REDIRECT_URI="http://localhost:3000"

# Remove tmp cookies
rm -rf "$COOKIE_TMP_FILE"

# LOGIN
LOGIN=$(curl http://localhost:3000/login -b $COOKIE_TMP_FILE -c $COOKIE_TMP_FILE -d "email=$USER_EMAIL&password=$USER_PASSWORD" --silent)

# Parse user_id from login
# USER_ID=$(echo $LOGIN | grep -Po '(?<="id": ")[^"]*')

# AUTHORIZATION
AUTHORIZATION=$(curl -b $COOKIE_TMP_FILE "http://localhost:3000/authorize/?client_id=$CLIENT_ID&response_type=code&redirect_uri=$REDIRECT_URI" --silent)
TRANSACTION_ID=$(echo $AUTHORIZATION | grep -Po '(?<="transactionID": ")[^"]*')

# Workaround to parse code
WORKAROUND_CODE=$(curl http://localhost:3000/authorize/decision -b $COOKIE_TMP_FILE -d "transaction_id=$TRANSACTION_ID&client_id=$CLIENT_ID" --silent)
CODE=$(echo $WORKAROUND_CODE | grep -Po '(?<=code\=)[^=]*')

# Token
TOKEN=$(curl http://localhost:3000/token -d "code=$CODE&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&redirect_uri=$REDIRECT_URI&grant_type=authorization_code" --silent)
ACCESS_TOKEN=$(echo $TOKEN | grep -Po '(?<="access_token":")[^"]*')

# Get protected resource
echo $(curl -b $COOKIE_TMP_FILE -H "Authorization: Bearer $ACCESS_TOKEN" -v "http://localhost:3000/info" --silent)
# echo $(curl -b $COOKIE_TMP_FILE -v "http://localhost:3000/info/?access_token=$ACCESS_TOKEN" --silent)

# Logout
echo $(curl http://localhost:3000/logout -b $COOKIE_TMP_FILE -d "" --silent)
rm $COOKIE_TMP_FILE
