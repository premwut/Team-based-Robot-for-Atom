*** Setting ***
Resource          ${CURDIR}/../configs/${ENV}/config.robot
Resource          ${CURDIR}/../constants/global.robot
Library           Selenium2Library
Library           DatabaseLibrary
Library           DateTime
Library           Collections
Library           HttpLibrary.HTTP

*** Keywords ***
Open Browser To Landing Page
    [Arguments]    ${BROWSER}=chrome
    Open browser    ${WEBSITE_URL}    ${BROWSER}
    Set Selenium Speed    ${SPEED}

Change Resolution To Desktop
    Set Window Size    1400    860

Change Resolution To Tablet
    Set Window Size    800    1024

Change Resolution To Mobile
    Set Window Size    375    667
