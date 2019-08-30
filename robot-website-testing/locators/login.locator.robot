*** Variables ***

${login_input_username}               id=username
${login_input_password}               id=password
${login_button_submit}                id=login-btn

${login_div_block}                    id=login-block
${login_div_notify}                   id=notify-error-box
${login_div_notify_text}              //div[@class='notify-error-text']
${login_username_field_error}         //*[@id="login-block"]/div/form/div[1]/div[2]/div
${login_password_field_error}         //*[@id="login-block"]/div/form/div[2]/div[2]/div
