import java.util.ArrayList;
import java.util.Scanner;
import java.util.Random;

public class Game {

    public static void main(String[] args) {

        Scanner input = new Scanner(System.in);
        Random rand = new Random();
        ArrayList<Theory> theories = new ArrayList<Theory>();

        String temp;
        boolean xFound = false;
        boolean hasCon = false;
        boolean correct = false;
        int start = 1;
        int lastStart = 1;
        int theoAmount;
        int[][] locVal = new int[4][3];
        for(int i = 0; i < 4; i++){
            locVal[i][1] = i+1;
            locVal[i][0] = 1;
        }
        int[] sector = new int[12];
        for(int i = 0; i < 12; i++){
            sector[i] = rand.nextInt(6);
        }

        while(!xFound){

            System.out.println("Enter move (Player " + locVal[0][1] + ")");
            switch(input.nextLine().toLowerCase()){
                case "survey" :
                    System.out.println("For what?");
                    int obj = input.nextInt();
                    System.out.println("Start Where?");
                    int sStart = input.nextInt();
                    System.out.println("End Where");
                    int sEnd = input.nextInt();
                    temp = input.nextLine();
                    int range = 0;
                    int tsStart = sStart;
                    while(tsStart != (sEnd + 1)%12){
                        tsStart = (tsStart + 1)%12;
                        range++;
                    }
                    if(range < 4) locVal[0][0] += 4;
                    else locVal[0][0] += 3;
                    int amount = Function.search(sStart, range, obj, sector);
                    System.out.println("Your survey has found " + amount);
                    break;
                case "research":
                    locVal[0][0] += 1;
                    break;
                case "target":
                    System.out.println("Which Sector?");
                    int targSec = input.nextInt();
                    temp = input.nextLine();
                    System.out.println("There is a " + sector[targSec-1] + " in " + targSec);
                    locVal[0][0] += 4;
                    break;
                case "x":
                    System.out.println("Enter Location of Planet X");
                    int xLoc = input.nextInt();
                    int preXLoc = xLoc - 1;
                    if(preXLoc == 0) preXLoc += 12;
                    System.out.println("Enter object in sector " + preXLoc);
                    int preObj = input.nextInt();
                    int postXLoc = (xLoc + 1)%12;
                    if(postXLoc == 0) postXLoc += 12;
                    System.out.println("Enter object in sector " + postXLoc);
                    int postObj = input.nextInt();
                    temp = input.nextLine();
                    if(preObj == sector[preXLoc - 1] && postObj == sector[postXLoc - 1] && xLoc - 1 == Function.findIndex(sector, 5)){
                        System.out.println("You have found Planet X");
                        locVal[0][2] += 10;
                        xFound = true;
                    } else System.out.println("You have failed to find Planet X");
                    locVal[0][0] += 5;
            }

            Function.sort(locVal);
            for(int i = 0; i < 4; i++){

                int secNum = locVal[i][0]%12;
                if(secNum == 0) secNum += 12;
                System.out.print("Player " + locVal[i][1] + " : " + secNum + " | ");
            }
            start = locVal[0][0]%12;
            if(start == 0) start = 12;
            int end = (start + 5)%12;
            if(end == 0) end = 12;
            System.out.println("Visible Sectors: " + start + " - " + end );
            
            for(int i = 1; i <= 10; i += 3) {
                for(int j = i; j <= locVal[0][0];j += 12) {
                    if(j > lastStart) theoAmount++;
                }
            }
            for(int i = 0; i < theoAmount; i++) {
                for(int i = 0; i < 4; i++) {
                    System.out.println("Player " + locVal[i][1] +", Enter Theory Location" );
                    String theoryLocation = input.nextLine();
                    if((!theoryLocation.isEmpty())){
                        System.out.println("Enter Object in Location");
                        int theoryObject = input.nextInt();
                        theories.add(new Theory(theoryObject, locVal[i][1], Integer.parseInt(theoryLocation)));
                    }
                }
                for (Theory theory : theories) theory.position -= 1;
                for(int i = 1; i < 13; i++){
                    for(Theory theory : theories){
                        if((theory.position == 0 || correct) && theory.sector == i){
                             if(theory.type == sector[i-1]) {
                                System.out.println("Player " + locVal[theory.player][1] + "is Correct, " + theory.type + "is in " + theory.sector);
                                locVal[theory.player][2] += 3;
                                correct = true;
                                if(theory.position == 0) locVal[theory.player][2]++;
                             } else {
                                 System.out.println("Player " + locVal[theory.player][1] + "is Incorrect, " + theory.type + "is not in " + theory.sector);
                                 locVal[theory.player][0] += 1;
                             }
                        }
                    }
                }
                Function.sort(locVal);
            }
            lastStart = locVal[0][0];
            theoAmount = 0;

            if(locVal[0][1] > 12 && !hasCon){
                int reveal = rand.nextInt(12);
                System.out.println("Conference: There is a " + sector[reveal] + " in Sector " + (reveal + 1));
                hasCon = true;
            }
        }

    }
}

class Function {
    public static int[][] sort(int[][] locVal) {

        int a, b, c;
        boolean d = true;

        while(d) {

            d = false;

            for (int i = 0; i < 3; i++) {

                if (locVal[i][0] > locVal[i + 1][0]) {

                    a = locVal[i][0];
                    b = locVal[i][1];
                    c = locVal[i][2];
                    locVal[i][0] = locVal[i + 1][0];
                    locVal[i][1] = locVal[i + 1][1];
                    locVal[i][2] = locVal[i + 1][2];
                    locVal[i + 1][0] = a;
                    locVal[i + 1][1] = b;
                    locVal[i + 1][2] = c;
                    d = true;
                }
            }
        }
        return locVal;
    }

    public static int search(int start, int range, int obj, int[] sector){
        int amount = 0;
        start--;
        for(int i = 0; i < range; i++){
            if(obj == sector[start + i]) amount++;
        }
        return amount;
    }

    public static int findIndex(int[] array, int element) {
        for (int i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return i;
            }
        }
        return -1;
    }
}

class Theory{

    public Theory(int type, int player, int sector){
        position = 3;
        this.type = type;
        this.player = player;
        this.sector = sector;
    }

    public int position;
    public int type;
    public int player;
    public int sector;
}