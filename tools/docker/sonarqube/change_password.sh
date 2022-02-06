change_password () {
    response=$(curl \
    --write-out '%{http_code}' \
    --silent \
    --output /dev/null \
    -u admin:admin \
    -X POST \
    "http://host.docker.internal:9000/api/users/change_password?login=admin&previousPassword=admin&password=$SONAR_PASSWORD")

    if [ "$response" == "204" ]
    then
        echo "Password changed successfully to $SONAR_PASSWORD"
        true
    elif [ "$response" == "401" ]
    then
        echo "Password already changed. Is $SONAR_PASSWORD"
        true
    else
        false
    fi
}

try_to_change_pass () {
    max_retry=20
    counter=0

    until change_password
    do
        sleep 4
        [[ $counter -eq $max_retry ]] && echo "Failed trying to reach SonarQube server" && exit 1
        echo -e "\nSonarQube server not accesible. Try #$counter"
        let "counter+=1" 
    done
}

try_to_change_pass
