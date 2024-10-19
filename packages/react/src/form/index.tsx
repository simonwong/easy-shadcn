import * as ReactHookForm from 'react-hook-form';
import { Form as FormComp, type FormProps, type FormFC } from './form';
export { FormItem, type FormItemProps } from './form-item';

const Form = FormComp as FormFC & typeof ReactHookForm;

Object.assign(Form, ReactHookForm);

export { Form, FormProps };
