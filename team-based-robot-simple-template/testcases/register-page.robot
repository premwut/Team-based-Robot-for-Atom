*** Settings ***
Library           Selenium2Library
Resource          ${CURDIR}/../resources/variables.robot
Resource          ${CURDIR}/../resources/team-based.robot
Resource          ${CURDIR}/../keywords/common.robot
Test Teardown     Close All browsers

*** Test Cases ***
