export interface BannerElement {
  key: string;
  text?: string;
  color?: string;
  image?: string;
  gradient?: string;
}

export interface BannerFormData {
  title: string;
  titleColor: string;
  highlight: string;
  highlightColor: string;
  content: string;
  contentColor: string;
  image: string | null;
  gradientStartColor: string;
  gradientEndColor: string;
  gradientDirection: string;
  selectedTemplateId?: string;
}

export interface BannerTemplate {
  _id: string;
  templateId: string;
  name: string;
  elements: BannerTemplateElement[];
}
export interface BannerInput {
  templateId: string;
  elements: BannerElement[];
}

export interface BannerTemplateElement {
  key: string;
  requiredTypes: RequiredTypes;
}

export interface Banner {
  _id: string;
  templateId: string;
  elements: BannerElement[];
  isActive?: boolean;
}

export interface RequiredTypes {
  text: boolean;
  color: boolean;
  image: boolean;
  gradient: boolean;
}

export interface BannerTemplate {
  _id: string;
  templateId: string;
  name: string;
  elements: {
    key: string;
    requiredTypes: RequiredTypes;
  }[];
}

export interface FormErrors {
  [key: string]: string | undefined;
  title?: string;
  highlight?: string;
  content?: string;
  image?: string;
  template?: string;
  background?: string;
}