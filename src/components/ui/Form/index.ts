// Form component exports
// Modularized Form components

import { FormText } from './FormText';
import { FormToggle } from './FormToggle';
import { FormItem } from './FormItem';
import { Section, HStack, VStack, Spacer } from './FormSection';
import { List } from './FormList';
import { ScrollView } from './FormScrollView';
import { TextField } from './FormTextField';
import { DatePicker } from './FormDatePicker';
import { Link } from './FormLink';
import { FormFont } from './contexts';

export { FormItem } from './FormItem';
export { FormText } from './FormText';
export { FormToggle } from './FormToggle';
export { DatePicker } from './FormDatePicker';
export { TextField } from './FormTextField';
export { Link } from './FormLink';
export { Section, HStack, VStack, Spacer } from './FormSection';
export { List, useListRefresh } from './FormList';
export { ScrollView } from './FormScrollView';
export * from './types';
export { mergedStyleProp, getFlatChildren, isStringishNode } from './utils';
export { ListStyleContext, SectionStyleContext, RefreshContext, FormFont, styles } from './contexts';

export const Text = FormText;
export const Toggle = FormToggle;

// Default export maintains compatibility
const Form = {
  List,
  ScrollView,
  Section,
  Text: FormText,
  TextField,
  Toggle: FormToggle,
  DatePicker,
  Link,
  FormFont,
  HStack,
  VStack,
  Spacer,
  // Legacy naming
  Item: FormItem,
};

export default Form;