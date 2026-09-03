import { Container } from '@/components/container';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="footer">
      <Container>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1 gap-1 font-normal text-2sm">
            <span className="text-gray-500">&copy;</span>
            <a href="#" target="_blank" className="text-gray-600 hover:text-primary">Just Catering </a>
            <span className="text-gray-500">{currentYear} - All Rights Reserved.</span>
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-2sm text-gray-600">
            <a href="javascript:void(0;" target="_blank" className="hover:text-primary" title="Terms & conditions">Terms & conditions</a>
            <a href="javascript:void(0;" target="_blank" className="hover:text-primary" title="Privacy policy">Privacy policy</a>
            <a href="javascript:void(0;" target="_blank" className="hover:text-primary" title="FAQ's">FAQ's</a>
            <a href="javascript:void(0;" target="_blank" className="hover:text-primary" title="Support">Support</a>
          </nav>
        </div>
      </Container>
    </footer>;
};
export { Footer };