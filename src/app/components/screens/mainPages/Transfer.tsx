import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { transferTabAtom } from "app/atoms";
import { TransferTab as TransferTabEnum } from "app/nav";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import WalletsList from "app/components/blocks/WalletsList";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";

import TransferTab from "./Transfer.Tab";

const Transfer: FC = () => {
  const activeTabRoute = useAtomValue(transferTabAtom);
  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.transfer === activeTabRoute)?.route,
    [activeTabRoute]
  );

  return (
    <>
      <WalletsList />

      <div className="flex min-h-0 grow">
        <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />
        <ScrollAreaContainer
          className="box-content w-full px-6"
          viewPortClassName="pb-20 pt-5"
          scrollBarClassName="py-0 pt-5 pb-20"
        >
          <div className="max-w-[23.25rem]">
            <TransferTab />
          </div>
        </ScrollAreaContainer>
      </div>
    </>
  );
};

export default Transfer;

const tabsContent = [
  {
    route: { page: "transfer", transfer: TransferTabEnum.Asset },
    title: "Asset",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "transfer", transfer: TransferTabEnum.Nft },
    title: "NFT",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
  {
    route: { page: "transfer", transfer: TransferTabEnum.Bridge },
    title: "Bridge",
    desc: "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
];