// Form component exports
// Modularized Form components

export { FormItem } from './FormItem';
export { FormText } from './FormText';
export { FormToggle } from './FormToggle';
export { DatePicker } from './FormDatePicker';
export { TextField } from './FormTextField';
export { Link } from './FormLink';
export { Section, HStack, VStack, Spacer } from './FormSection';
export * from './types';
export { mergedStyleProp, getFlatChildren, isStringishNode } from './utils';

// Re-export remaining components from the original file
import * as OriginalForm from '../Form';

export const List = OriginalForm.List;
export const ScrollView = OriginalForm.ScrollView;
export const Text = FormText;
export const Toggle = FormToggle;
export const FormFont = OriginalForm.FormFont;
export const useListRefresh = OriginalForm.useListRefresh;

// Context exports
export const ListStyleContext = OriginalForm.ListStyleContext;
export const SectionStyleContext = OriginalForm.SectionStyleContext;
export const RefreshContext = OriginalForm.RefreshContext;
export const styles = OriginalForm.styles;

// Default export maintains compatibility
const Form = {
  List: OriginalForm.List,
  ScrollView: OriginalForm.ScrollView,
  Section,
  Text: FormText,
  TextField,
  Toggle: FormToggle,
  DatePicker,
  Link,
  FormFont: OriginalForm.FormFont,
  HStack,
  VStack,
  Spacer,
  // Legacy naming
  Item: FormItem,
};

export default Form;