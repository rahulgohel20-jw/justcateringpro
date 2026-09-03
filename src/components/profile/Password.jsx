import { Input, Button, Form, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { ChangePassword } from "@/services/apiServices";
import { FormattedMessage } from "react-intl";

export default function Password() {
  const [form] = Form.useForm();

  const userId = Number(localStorage.getItem("userId"));

  const onFinish = async (values) => {
    const payload = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      conPassword: values.conPassword,
      userId:userId ,
    };

    try {
      const res = await ChangePassword(payload);

      if (res?.data?.msg) {
        message.success(res.data.msg);
      } else {
        message.success("Password changed successfully");
      }

      form.resetFields();
    } catch (err) {
      const response = err?.response?.data;

      if (response?.msg) {
        message.error(response.msg);
      } else if (response?.errors) {
        const allErrors = Object.values(response.errors).flat();
        allErrors.forEach((e) => message.error(e));
      } else {
        message.error("Something went wrong while changing password.");
      }

      console.error("Change Password Error:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="relative">
        <div className="h-18 flex flex-col rounded-t-lg gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#505050] text-2xl font-extrabold"><FormattedMessage id="PROFILE.CHANGE_PASSWORD" defaultMessage="Change Password" /></span>
          </div>
          <span className="text-gray-500 text-sm">
            <FormattedMessage id="PROFILE.CHANGE_PASSWORD_DESC" defaultMessage="Please enter your current password to change your password." />
          </span>
        </div>
        <div className="border-b"></div>
      </div>

      <div className="pt-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          
        >
          <Form.Item
            label={
              <span>
                <FormattedMessage id="PROFILE.CURRENT_PASSWORD" defaultMessage="Current Password" />{" "}
                <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                  *
                </span>
              </span>
            }
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password className="p-2" placeholder="Current Password" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                <FormattedMessage id="PROFILE.NEW_PASSWORD" defaultMessage="New Password" />{" "}
                <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                  *
                </span>
              </span>
            }
            name="newPassword"
           
          >
            <Input.Password className="p-2" placeholder="New Password" />
          </Form.Item>

          {/* Real-time password requirement indicator */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.newPassword !== currentValues.newPassword
          }>
            {({ getFieldValue }) => {
              const password = getFieldValue('newPassword') || '';
              const isValid = password.length >= 8 && password.length <= 12;
              
              return (
                <div className="flex items-center gap-2 -mt-4 mb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isValid ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <svg 
                      className="w-4 h-4 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  <span className={`text-sm transition-colors ${
                    isValid ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    <FormattedMessage id="PROFILE.NEW_PASSWORD_REQUIREMENTS" defaultMessage="Your new password must be 8 - 12 characters long" />
                  </span>
                </div>
              );
            }}
          </Form.Item>

          <Form.Item
            label={
              <span>
                <FormattedMessage id="PROFILE.CONFIRM_PASSWORD" defaultMessage="Confirm Password" />{" "}
                <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                  *
                </span>
              </span>
            }
            name="conPassword"
            dependencies={['newPassword']}
           
          >
            <Input.Password className="p-2" placeholder="Confirm Password" />
          </Form.Item>

          {/* Password match indicator */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
            prevValues.newPassword !== currentValues.newPassword ||
            prevValues.conPassword !== currentValues.conPassword
          }>
            {({ getFieldValue }) => {
              const newPassword = getFieldValue('newPassword') || '';
              const conPassword = getFieldValue('conPassword') || '';
              const isMatching = conPassword.length > 0 && newPassword === conPassword;
              
              return (
                <div className="flex items-center gap-2 -mt-4 mb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isMatching ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <svg 
                      className="w-4 h-4 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  <span className={`text-sm transition-colors ${
                    isMatching ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    <FormattedMessage id="PROFILE.PASSWORDS_MATCH" defaultMessage="Passwords must match" />
                  </span>
                </div>
              );
            }}
          </Form.Item>

          <Form.Item className="flex justify-center">
            <Button
              type="primary"
              htmlType="submit"
              className="p-2 bg-[#004986] border-none rounded-md px-8"
            >
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}