// Đối tượng Validator
function Validator(options) {

    function getParent(element, selector) {

        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;

        }




    };


    var selectorRules = {};
    // Hàm thực thiện vadidate
    function validate(inputElement, rule) {
        // value: inputElement.value
        // test function: rule.test

        var errorMesage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        // Lấy ra các rule của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng roles và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMesage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );

                    break;
                default:
                    errorMesage = rules[i](inputElement.value);

            }

            if (errorMesage) break;
        }

        if (errorMesage) {
            errorElement.innerText = errorMesage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');

        }
        return !errorMesage;

    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);


    if (formElement) {

        // khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();
            isFormValid = true;
            // Lặp qua từng rule và vadidate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);

                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }

            });



            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce(function (value, input) {
                        switch (input.type) {
                            case 'radio':
                                value[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;

                                break;

                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    value[input.name] = '';

                                    return value;
                                }

                                if (!Array.isArray(value[input.name])) {
                                    value[input.name] = [];

                                }
                                value[input.name].push(input.value);

                                break;
                            case 'file':
                                value[input.name] = input.files;

                                break;

                            default:
                                value[input.name] = input.value;
                        }


                        return value;
                    }, {});


                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hàng vi mặc định
                else {
                    formElement.submit();
                }

            } else {

            }
        }

        // Xử lý lặp qua mỗi rule và xử lý
        options.rules.forEach(function (rule) {
            // Lưu lại các rule cho mỗi input
            // selectorRules[rule.selector] = rule.test;
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {

                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {

                    validate(inputElement, rule)

                }
                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }


            });



        })

    }


};

// Định nghĩa các rules
// Nguyên tắc của các rules"
// 1.Khi có lỗi: => trả ra messages lỗi
// 2: Khi hợp lệ => không trả ra cái gì (underfine)

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }

};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    }

};
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {

            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    }

};
Validator.isConfirmmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }

};


// Mong muốn của chúng ta sử
// Validator này sử dụng chung cho nhiều form khác nhau thay id ...
// Form đăng kí
Validator({
    form: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
        Validator.isRequired('#fullname', 'Vui lòng nhập tên đầy đủ của bạn'),
        Validator.isRequired('#email'),
        Validator.isEmail('#email'),
        Validator.minLength('#password', 8),
        Validator.isRequired('#password_confirmation'),
        Validator.isConfirmmed('#password_confirmation', function () {
            return document.querySelector('#form-1 #password').value;
        }, 'Mật khẩu nhập lại không chính xác')
        // Validator.isRequired('input[name="gender"]'), // input chekxbox, radio
        // Validator.isRequired('#avatar'), // input type =file
    ],
    onSubmit: function (data) {
        // call API
        console.log(data);
    }
});

// Form đăng nhập
Validator({
    form: '#form-2',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [

        Validator.isRequired('#email1'),
        Validator.isEmail('#email1'),
        Validator.minLength('#password1', 6),

    ],
    onSubmit: function (data) {
        // call API
        console.log(data);
    }
});