export class ExifRestorer {

      KEY_STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

      restore(origFileBase64:any, resizedFileBase64:any) {
        if (!origFileBase64.match('data:image/jpeg;base64,')) {
          return resizedFileBase64;
        }
        var rawImage = this.decode64(origFileBase64.replace('data:image/jpeg;base64,', ''));
        var segments = this.slice2Segments(rawImage);
        var image = this.exifManipulation(resizedFileBase64, segments);
        return this.encode64(image);
      };

      exifManipulation(resizedFileBase64:string, segments:any) {
        var exifArray = this.getExifArray(segments),
          newImageArray = this.insertExif(resizedFileBase64, exifArray),
          aBuffer = new Uint8Array(newImageArray);
        return aBuffer;
      };

      getExifArray(segments:any) {
        var seg:number[];
        for (var x = 0; x < segments.length; x++) {
          seg = segments[x];
          if (seg[0] === 255 && seg[1] === 225) { //(ff e1)
            return seg;
          }
        }
        return [];
      };

      insertExif(resizedFileBase64:string, exifArray:any[]) {
        var imageData = resizedFileBase64.replace('data:image/jpeg;base64,', ''),
          buf = this.decode64(imageData),
          separatePoint = buf.indexOf(255,3),
          mae = buf.slice(0, separatePoint),
          ato = buf.slice(separatePoint),
          array = mae;
        array = array.concat(exifArray);
        array = array.concat(ato);
        return array;
      };

      slice2Segments(rawImageArray:number[]) {
        var head = 0,
          segments:any[] = [];

        while (1) {
          if (rawImageArray[head] === 255 && rawImageArray[head + 1] === 218) {break;}
          if (rawImageArray[head] === 255 && rawImageArray[head + 1] === 216) {
            head += 2;
          } else {
            var length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3],
              endPoint = head + length + 2,
              seg = rawImageArray.slice(head, endPoint);
            segments.push(seg);
            head = endPoint;
          }
          if (head > rawImageArray.length) {break;}
        }

        return segments;
      };


      encode64(input:any) {
        var output = '',
          chr1:any, chr2:any, chr3:any = '',
          enc1:any, enc2:any, enc3:any, enc4:any = '',
          i = 0;

        do {
          chr1 = input[i++];
          chr2 = input[i++];
          chr3 = input[i++];

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }

          output = output +
          this.KEY_STR.charAt(enc1) +
          this.KEY_STR.charAt(enc2) +
          this.KEY_STR.charAt(enc3) +
          this.KEY_STR.charAt(enc4);
          chr1 = chr2 = chr3 = '';
          enc1 = enc2 = enc3 = enc4 = '';
        } while (i < input.length);

        return output;
      };

      decode64(input:any) {
        var chr1:any, chr2:any, chr3:any = '',
          enc1:any, enc2:any, enc3:any, enc4:any = '',
          i = 0,
          buf:any[] = [];

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
       input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        do {
          enc1 = this.KEY_STR.indexOf(input.charAt(i++));
          enc2 = this.KEY_STR.indexOf(input.charAt(i++));
          enc3 = this.KEY_STR.indexOf(input.charAt(i++));
          enc4 = this.KEY_STR.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          buf.push(chr1);

          if (enc3 !== 64) {
            buf.push(chr2);
          }
          if (enc4 !== 64) {
            buf.push(chr3);
          }

          chr1 = chr2 = chr3 = '';
          enc1 = enc2 = enc3 = enc4 = '';

        } while (i < input.length);

        return buf;
      };
};
