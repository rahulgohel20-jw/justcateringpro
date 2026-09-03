import clsx from 'clsx';
import { useEffect } from 'react';
import { Container } from '@/components/container';
import { MegaMenu } from '../mega-menu';
import { HeaderLogo, HeaderTopbar } from './';
import { Breadcrumbs, useDemo1Layout } from '../';
import { useLocation } from 'react-router';

const Header = () => {
  const { headerSticky } = useDemo1Layout();
  const { pathname } = useLocation();

  useEffect(() => {
    if (headerSticky) {
      document.body.setAttribute('data-sticky-header', 'on');
    } else {
      document.body.removeAttribute('data-sticky-header');
    }
  }, [headerSticky]);

  return (
   <header
  className={clsx(
    'header fixed top-0 end-0 flex items-stretch shrink-0 bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark] border-b',
    headerSticky && 'shadow-sm'
  )}
  style={{ 
    zIndex: 1,
    left: 'var(--tw-sidebar-width, 265px)' 
  }}
>
      <Container
        className="flex lg:justify-end justify-between items-stretch lg:gap-4"
        style={{ overflow: 'visible' }} // ← allow dropdowns to escape
      >
        <HeaderLogo />
        <HeaderTopbar />
      </Container>
    </header>
  );
};

export { Header };