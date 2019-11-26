*** Settings ***
Library           Selenium2Library
# Resource          ${CURDIR}/../locators/user.locator.robot
# Resource          ${CURDIR}/../locators/side-menu.locator.robot
# Resource          ${CURDIR}/../keywords/common/common.keyword.robot
# Resource          ${CURDIR}/../keywords/admin.keyword.robot
# Resource          ${CURDIR}/../keywords/login.keyword.robot
# Resource          ${CURDIR}/../keywords/user.keyword.robot

*** Variables ***
# alpha
#************************** Common Variables
${BROWSER}             		  	Chrome
${SPEED}               		  	0.3
${TIMEOUT}    					      15

${WEB_BASE_URL}               https://robot-web-testing.herokuapp.com

#************************** Database Variables
${DB_HOSTNAME}         			  ec2-54-83-192-68.compute-1.amazonaws.com
${DB_USERNAME}         			  bnanpldhbmltdo
${DB_PASSWORD}         			  394471855cb890591b1cbc85c528724abb2691eb5c9414695cfa28d10843a7a2
${DB_NAME}             			  de8l5buj6j3i1s
${DB_CHARSET}          			  utf8
${DB_PORT}             			  5432

#************************** Users Variables
${USERNAME_NORMAL}            test
${PASSWORD_NORMAL}   		      P@ssw0rd
${USERNAME_ADMIN}   		      admin
${PASSWORD_ADMIN}   		      AdminP@ssw0rd
