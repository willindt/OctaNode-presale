import { ReactComponent as ForumIcon } from "../../assets/icons/forum.svg";
import { ReactComponent as GovIcon } from "../../assets/icons/governance.svg";
import { ReactComponent as DocsIcon } from "../../assets/icons/docs.svg";
import { SvgIcon } from "@material-ui/core";
import { AccountBalanceOutlined, MonetizationOnOutlined } from "@material-ui/icons";

const externalUrls = [
  {
    title: "Athen Loan",
    label: "(Coming soon)",
    icon: <MonetizationOnOutlined viewBox="0 0 20 24" />,
  },
  {
    title: "Athen Borrow",
    label: "(Coming soon)",
    icon: <MonetizationOnOutlined viewBox="0 0 20 24" />,
  },
  {
    title: "Athen PRO",
    label: "(Coming soon)",
    icon: <AccountBalanceOutlined viewBox="0 0 20 24" />,
  },
  // {
  //   title: "Governance",
  //   url: "https://snapshot.org/#/hectordao.eth",
  //   icon: <SvgIcon color="primary" component={GovIcon} />,
  // },
  {
    title: "Docs",
    url: "https://athen.gitbook.io/welcome-to-usdaoe/",
    icon: <SvgIcon color="primary" component={DocsIcon} />,
  },
  // {
  //   title: "Feedback",
  //   url: "https://olympusdao.canny.io/",
  //   icon: <SvgIcon color="primary" component={FeedbackIcon} />,
  // },
];

export default externalUrls;
