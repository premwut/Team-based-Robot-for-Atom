*** Settings ***
Library           Collections
Library           String
Resource          ${CURDIR}/../common/common.keyword.robot

*** Keywords ***
Query User By Email
    [Arguments]    ${email}
    Connect To Postgresql Database
    ${result}=    Query    SELECT usr_id, email, username FROM users WHERE email = '${email}'
    Disconnect from Database
    Return From Keyword    ${result[0]}

Delete User By Email
    [Arguments]    ${email}
    Connect To Postgresql Database
    Execute Sql String    DELETE FROM users WHERE email = '${email}'
    Log To Console    Delete user complete
    Disconnect from Database
